import type {
  OperationDraft,
  OperationIntentKey,
} from "../../models/operation-input.schema"
import {
   sanitizeActiveIntents,
  type OperationStepCatalog,
} from "../steps/interpreter"
import { STEP_ORDER } from "../steps/order"
import type {
  EntityRef,
  IntentPlanNodeInput,
  OperationExecutionPlan,
  OperationNodeAction,
  OperationPlanNode,
  OperationPointers,
  ResolvedNodeOutput,
} from "./types"

function isEntityRef(val: unknown): val is EntityRef {
  if (!val || typeof val !== "object") return false
  const candidate = val as Record<string, unknown>
  if (candidate.kind === "existing" && typeof candidate.id === "number") {
    return true
  }
  if (candidate.kind === "node" && typeof candidate.nodeId === "string") {
    return true
  }
  return false
}

/**
 * Extrai recursivamente todos os `nodeId`s referenciados por `EntityRef`s dentro de uma `OperationNodeAction`.
 */
export function extractNodeDependencies(action: OperationNodeAction): string[] {
  const deps = new Set<string>()

  function walk(value: unknown) {
    if (!value || typeof value !== "object") return
    if (isEntityRef(value)) {
      if (value.kind === "node") {
        deps.add(value.nodeId)
      }
      return
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }
    for (const prop of Object.values(value)) {
      walk(prop)
    }
  }

  walk(action)
  return Array.from(deps)
}

/**
 * Ordena os nós do plano topologicamente (Algoritmo de Kahn com desempate determinístico por `order` e `id`).
 * Garante que todo nó produtor seja executado antes de qualquer nó consumidor.
 * Lança erro se houver dependência circular.
 */
export function sortNodesTopologically<TIntentKey extends string>(
  rawNodes: readonly IntentPlanNodeInput<TIntentKey>[]
): OperationPlanNode<TIntentKey>[] {
  const nodeMap = new Map<string, OperationPlanNode<TIntentKey>>()

  for (const raw of rawNodes) {
    if (nodeMap.has(raw.id)) {
      throw new Error(`ID de nó duplicado no plano de operação: "${raw.id}"`)
    }
    const dependsOn = extractNodeDependencies(raw.action).filter(
      (depId) => depId !== raw.id
    )
    nodeMap.set(raw.id, {
      ...raw,
      dependsOn,
    })
  }

  // Valida que todas as dependências apontam para nós existentes no plano
  const inDegree = new Map<string, number>()
  const dependents = new Map<string, string[]>()

  for (const [id] of nodeMap) {
    inDegree.set(id, 0)
    dependents.set(id, [])
  }

  for (const [id, node] of nodeMap) {
    for (const depId of node.dependsOn) {
      if (!nodeMap.has(depId)) {
        throw new Error(
          `O nó "${id}" referencia o nó inexistente "${depId}" no plano de operação.`
        )
      }
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
      dependents.get(depId)!.push(id)
    }
  }

  const compareNodes = (aId: string, bId: string): number => {
    const a = nodeMap.get(aId)!
    const b = nodeMap.get(bId)!
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  }

  const readyQueue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      readyQueue.push(id)
    }
  }
  readyQueue.sort(compareNodes)

  const sorted: OperationPlanNode<TIntentKey>[] = []

  while (readyQueue.length > 0) {
    const currentId = readyQueue.shift()!
    sorted.push(nodeMap.get(currentId)!)

    for (const nextId of dependents.get(currentId) ?? []) {
      const nextDegree = (inDegree.get(nextId) ?? 1) - 1
      inDegree.set(nextId, nextDegree)
      if (nextDegree === 0) {
        readyQueue.push(nextId)
        readyQueue.sort(compareNodes)
      }
    }
  }

  if (sorted.length !== nodeMap.size) {
    throw new Error(
      "Dependência circular detectada no grafo de execução da operação (DAG inválido)."
    )
  }

  return sorted
}

/**
 * Resolve uma `EntityRef` para seu `id: number` final a partir do mapa de nós já materializados.
 */
export function resolveEntityRef(
  ref: EntityRef | null | undefined,
  resolvedNodes: Readonly<Record<string, ResolvedNodeOutput>>
): number | null {
  if (!ref) return null
  if (ref.kind === "existing") {
    return ref.id
  }

  const nodeOutput = resolvedNodes[ref.nodeId]
  if (!nodeOutput) {
    throw new Error(
      `Não foi possível resolver a referência para o nó "${ref.nodeId}": nó ainda não executado.`
    )
  }

  if (ref.port) {
    const portId = nodeOutput.ports?.[ref.port]
    if (typeof portId !== "number") {
      throw new Error(
        `O nó "${ref.nodeId}" não produziu a porta de saída "${ref.port}".`
      )
    }
    return portId
  }

  return nodeOutput.id
}

/**
 * Calcula o Quadro-Negro de ponteiros e coleta os nós adicionados pelas intenções ativas.
 * Pode ser invocado de forma pura durante o interpretador para alimentar `autoActivateWhen` e `offer.when`.
 */
export function computeOperationPointersAndNodes<
  TIntentKey extends string = OperationIntentKey,
>(
  payload: Partial<OperationDraft>,
  activeIntents: readonly TIntentKey[],
  catalog: OperationStepCatalog<TIntentKey>
): {
  pointers: OperationPointers
  collectedNodes: IntentPlanNodeInput<TIntentKey>[]
} {
  const base = payload.base
  const custodyRef: EntityRef | null =
    typeof base?.custodyBalanceId === "number" && base.custodyBalanceId > 0
      ? { kind: "existing", id: base.custodyBalanceId }
      : null

  const categoryRootRef: EntityRef | null =
    typeof base?.categoryId === "number" && base.categoryId > 0
      ? { kind: "existing", id: base.categoryId }
      : null

  const subcategoryRef: EntityRef | null =
    typeof base?.subcategoryId === "number" && base.subcategoryId > 0
      ? { kind: "existing", id: base.subcategoryId }
      : null

  const pointers: OperationPointers = {
    custody: custodyRef,
    categoryRoot: categoryRootRef,
    counterpart: subcategoryRef ?? categoryRootRef,
    mainEntry: null,
    extras: {},
  }

  const collectedNodes: IntentPlanNodeInput<TIntentKey>[] = []

  const addNode = (node: IntentPlanNodeInput<TIntentKey>): EntityRef => {
    collectedNodes.push(node)
    return { kind: "node", nodeId: node.id }
  }

  // Ordena as intenções ativas pela menor ordem de seus passos (ou alfabeticamente)
  const sortedIntents = [...activeIntents].sort((a, b) => {
    const minOrderA = Math.min(
      ...(catalog.intents[a]?.addSteps.map((s) => s.order) ?? [
        Number.MAX_SAFE_INTEGER,
      ])
    )
    const minOrderB = Math.min(
      ...(catalog.intents[b]?.addSteps.map((s) => s.order) ?? [
        Number.MAX_SAFE_INTEGER,
      ])
    )
    if (minOrderA !== minOrderB) return minOrderA - minOrderB
    return a.localeCompare(b)
  })

  // Cada intenção ativa contribui com seus nós e atualiza os ponteiros do Quadro-Negro
  for (const key of sortedIntents) {
    const def = catalog.intents[key]
    if (def?.plan) {
      def.plan({
        payload,
        activeIntents,
        pointers,
        addNode,
      })
    }
  }

  return { pointers, collectedNodes }
}

/**
 * Compila de forma 100% pura e determinística o `OperationDraft` em um `OperationExecutionPlan` (DAG).
 * Serve como fonte única de verdade tanto para a visualização de Revisão/Inspector (Frontend)
 * quanto para o Executor Transacional (Backend).
 */
export function compileOperationPlan<
  TIntentKey extends string = OperationIntentKey,
>(
  payload: Partial<OperationDraft>,
  catalog: OperationStepCatalog<TIntentKey>,
  explicitIntents?: readonly TIntentKey[]
): OperationExecutionPlan<TIntentKey> {
  const rawIntents =
    explicitIntents ??
    ((payload.intents ?? []) as unknown as readonly TIntentKey[])
  const activeIntents = sanitizeActiveIntents(rawIntents, catalog, payload)

  // 1. Calcula ponteiros e coleta nós das intenções
  const { pointers, collectedNodes } = computeOperationPointersAndNodes(
    payload,
    activeIntents,
    catalog
  )

  const addNode = (node: IntentPlanNodeInput<TIntentKey>): EntityRef => {
    collectedNodes.push(node)
    return { kind: "node", nodeId: node.id }
  }

  // 2. Emite o nó de lançamento principal se ainda não tiver sido emitido/substituído por uma intenção
  if (!pointers.mainEntry) {
    const nature = payload.nature ?? "PAY"
    const amountCents =
      typeof payload.base?.amount === "number"
        ? Math.round(payload.base.amount)
        : 0
    const custodyType = payload.base?.custodyType ?? "WALLET"

    pointers.mainEntry = addNode({
      id: "base.direct_entry",
      source: "BASE",
      order: STEP_ORDER.DETAILS, // 3000 (a ordenação topológica o posicionará após suas dependências)
      stepId: "base.details",
      action: {
        type: "CREATE_DIRECT_ENTRY",
        nature,
        custody: pointers.custody,
        custodyType,
        counterpart: pointers.counterpart,
        amountCents,
        description: payload.base?.description?.trim() ?? "",
        dueDate: payload.base?.dueDate ?? "",
        competanceDate: payload.base?.competanceDate ?? null,
      },
    })
  }

  // 3. Ordena os nós topologicamente com base nas referências simbólicas (`EntityRef`)
  const sortedNodes = sortNodesTopologically(collectedNodes)

  return {
    nodes: sortedNodes,
    pointers: {
      ...pointers,
      extras: { ...pointers.extras },
    },
    activeIntents,
  }
}
