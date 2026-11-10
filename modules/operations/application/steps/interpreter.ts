import type {
  OperationDraft,
  OperationIntentKey,
} from "../../models/operation-input.schema"
import { computeOperationPointersAndNodes } from "../plan/compiler"
import type { IntentDefinition } from "../intents/types"
import type { OperationLookupData } from "../summary/types"
import type {
  IntentPredicateContext,
  StepDefinition,
  StepResolutionContext,
} from "./types"

export interface OperationStepCatalog<TIntentKey extends string = string> {
  readonly base: readonly StepDefinition<TIntentKey>[]
  readonly intents: Partial<
    Record<
      TIntentKey,
      IntentDefinition<TIntentKey, StepDefinition<TIntentKey>>
    >
  >
}

export interface IntentValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Verifica exclusão mútua de forma simétrica:
 * A exclui B se A.excludes contém B OU se B.excludes contém A.
 */
export function areIntentsMutuallyExclusive<TIntentKey extends string>(
  a: TIntentKey,
  b: TIntentKey,
  catalog: OperationStepCatalog<TIntentKey>
): boolean {
  if (a === b) return false
  const defA = catalog.intents[a]
  const defB = catalog.intents[b]
  return Boolean(defA?.excludes.includes(b) || defB?.excludes.includes(a))
}

export function isOfferAnchoredAtStep(
  offerAt: string | readonly string[] | undefined,
  stepId: string
): boolean {
  if (!offerAt) return false
  if (typeof offerAt === "string") return offerAt === stepId
  return offerAt.includes(stepId)
}

/**
 * Remove intenções cujos pré-requisitos (`requires`), exclusões (`excludes`) ou
 * condições de dados (`offer.when`) não estejam mais satisfeitos.
 * Executa em ponto fixo para propagar ativações automáticas (`autoActivateWhen`),
 * implicações (`implies`) e revogações em cascata usando os ponteiros semânticos (`OperationPointers`).
 */
export function sanitizeActiveIntents<TIntentKey extends string>(
  selected: readonly TIntentKey[],
  catalog: OperationStepCatalog<TIntentKey>,
  data?: Partial<OperationDraft>,
  lookups?: OperationLookupData
): TIntentKey[] {
  let current = Array.from(new Set(selected)).filter((key) =>
    Boolean(catalog.intents[key])
  )

  let changed = true
  while (changed) {
    changed = false
    const currentSet = new Set(current)

    // 1. Expande intenções com implicações declarativas clássicas (se houver)
    for (const key of [...current]) {
      const def = catalog.intents[key]
      if (def?.implies) {
        for (const implied of def.implies) {
          if (!currentSet.has(implied) && catalog.intents[implied]) {
            current.push(implied)
            currentSet.add(implied)
            changed = true
          }
        }
      }
    }

    // 2. Calcula ponteiros com base no rascunho e nas intenções ativas atuais
    const enrichedDataForPointers: Partial<OperationDraft> = {
      ...data,
      intents: current as OperationIntentKey[],
    }
    const { pointers } = computeOperationPointersAndNodes(
      enrichedDataForPointers,
      current,
      catalog
    )
    const predicateCtx: IntentPredicateContext = {
      pointers,
      lookups,
    }

    // 3. Avalia ativação automática declarativa (autoActivateWhen) para intenções inativas
    const allKeys = Object.keys(catalog.intents) as TIntentKey[]
    for (const candidate of allKeys) {
      if (currentSet.has(candidate)) continue
      const def = catalog.intents[candidate]
      if (!def?.autoActivateWhen) continue

      const hasConflict = current.some((active) =>
        areIntentsMutuallyExclusive(candidate, active, catalog)
      )
      if (hasConflict) continue

      const reqsMet = def.requires.every((req) => currentSet.has(req))
      if (!reqsMet) continue

      if (def.autoActivateWhen(enrichedDataForPointers, predicateCtx)) {
        current.push(candidate)
        currentSet.add(candidate)
        changed = true
      }
    }

    // Se alguma intenção foi auto-ativada, re-executa o loop com os novos ponteiros
    if (changed) {
      continue
    }

    // 4. Validação e sanitização das intenções ativas
    const next: TIntentKey[] = []

    for (const key of current) {
      const def = catalog.intents[key]
      if (!def) {
        changed = true
        continue
      }

      const missingReq = def.requires.some((req) => !currentSet.has(req))
      if (missingReq) {
        changed = true
        continue
      }

      const hasConflict = next.some((accepted) =>
        areIntentsMutuallyExclusive(key, accepted, catalog)
      )
      if (hasConflict) {
        changed = true
        continue
      }

      const enrichedData: Partial<OperationDraft> = {
        ...data,
        intents: current as OperationIntentKey[],
      }
      if (def.offer?.when && !def.offer.when(enrichedData, predicateCtx)) {
        changed = true
        continue
      }

      next.push(key)
    }

    if (next.length !== current.length) {
      changed = true
    }
    current = next
  }

  return current
}

/**
 * Valida uma seleção de intenções contra `excludes`, `requires` e `offer.when`.
 */
export function validateIntentSelection<TIntentKey extends string>(
  selected: readonly TIntentKey[],
  catalog: OperationStepCatalog<TIntentKey>,
  data?: Partial<OperationDraft>,
  lookups?: OperationLookupData
): IntentValidationResult {
  const errors: string[] = []
  const unique = Array.from(new Set(selected))
  const selectedSet = new Set(unique)
  const enrichedData: Partial<OperationDraft> = {
    ...data,
    intents: unique as OperationIntentKey[],
  }

  const { pointers } = computeOperationPointersAndNodes(
    enrichedData,
    unique,
    catalog
  )
  const predicateCtx: IntentPredicateContext = {
    pointers,
    lookups,
  }

  for (let i = 0; i < unique.length; i++) {
    const key = unique[i]
    const def = catalog.intents[key]
    if (!def) {
      errors.push(`Intenção desconhecida: "${key}"`)
      continue
    }

    for (const req of def.requires) {
      if (!selectedSet.has(req)) {
        errors.push(`A intenção "${key}" requer "${req}"`)
      }
    }

    if (def.offer?.when && !def.offer.when(enrichedData, predicateCtx)) {
      errors.push(
        `A intenção "${key}" não satisfaz a condição necessária dos dados atuais`
      )
    }

    for (let j = i + 1; j < unique.length; j++) {
      const other = unique[j]
      if (areIntentsMutuallyExclusive(key, other, catalog)) {
        errors.push(
          `As intenções "${key}" e "${other}" são mutuamente exclusivas`
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Retorna as intenções que podem ser ativadas a partir do estado atual.
 */
export function availableIntents<TIntentKey extends string>(
  selected: readonly TIntentKey[],
  catalog: OperationStepCatalog<TIntentKey>,
  options?: {
    atStepId?: string
    data?: Partial<OperationDraft>
    lookups?: OperationLookupData
  }
): TIntentKey[] {
  const sanitized = sanitizeActiveIntents(
    selected,
    catalog,
    options?.data,
    options?.lookups
  )
  const selectedSet = new Set(sanitized)
  const enrichedData: Partial<OperationDraft> = {
    ...options?.data,
    intents: sanitized as OperationIntentKey[],
  }

  const { pointers } = computeOperationPointersAndNodes(
    enrichedData,
    sanitized,
    catalog
  )
  const predicateCtx: IntentPredicateContext = {
    pointers,
    lookups: options?.lookups,
  }

  const keys = Object.keys(catalog.intents) as TIntentKey[]

  return keys.filter((candidate) => {
    if (selectedSet.has(candidate)) return false
    const def = catalog.intents[candidate]
    if (!def) return false

    if (
      options?.atStepId &&
      !isOfferAnchoredAtStep(def.offer?.at, options.atStepId)
    ) {
      return false
    }

    const reqsMet = def.requires.every((req) => selectedSet.has(req))
    if (!reqsMet) return false

    const conflict = sanitized.some((active) =>
      areIntentsMutuallyExclusive(candidate, active, catalog)
    )
    if (conflict) return false

    if (def.offer?.when && !def.offer.when(enrichedData, predicateCtx)) {
      return false
    }

    return true
  })
}

/**
 * Retorna a lista de intenções para renderizar como pills em uma etapa lógica (`stepId`).
 */
export function offeredIntentsForStep<TIntentKey extends string>(
  selected: readonly TIntentKey[],
  catalog: OperationStepCatalog<TIntentKey>,
  stepId: string,
  data?: Partial<OperationDraft>,
  lookups?: OperationLookupData
): IntentDefinition<TIntentKey, StepDefinition<TIntentKey>>[] {
  const active = sanitizeActiveIntents(selected, catalog, data, lookups)
  const activeSet = new Set(active)
  const availableSet = new Set(
    availableIntents(active, catalog, { atStepId: stepId, data, lookups })
  )

  const allKeys = Object.keys(catalog.intents) as TIntentKey[]
  const result: IntentDefinition<TIntentKey, StepDefinition<TIntentKey>>[] = []

  for (const key of allKeys) {
    const def = catalog.intents[key]
    if (!def || !isOfferAnchoredAtStep(def.offer?.at, stepId)) continue
    if (activeSet.has(key) || availableSet.has(key)) {
      result.push(def)
    }
  }

  return result
}

/**
 * Resolve de forma determinística e 100% declarativa a lista ordenada de etapas lógicas ativas.
 */
export function resolveSteps<TIntentKey extends string>(
  context: StepResolutionContext<TIntentKey>,
  catalog: OperationStepCatalog<TIntentKey>
): StepDefinition<TIntentKey>[] {
  const activeIntents = sanitizeActiveIntents(
    context.intents,
    catalog,
    context.data,
    context.lookups
  )

  const stepMap = new Map<string, StepDefinition<TIntentKey>>()
  for (const step of catalog.base) {
    stepMap.set(step.id, step)
  }

  const sortedIntentKeys = [...activeIntents].sort((a, b) =>
    a.localeCompare(b)
  )
  for (const key of sortedIntentKeys) {
    const intentDef = catalog.intents[key]
    if (!intentDef) continue
    for (const step of intentDef.addSteps) {
      stepMap.set(step.id, step)
    }
  }

  const removedIds = new Set<string>()
  for (const key of sortedIntentKeys) {
    const intentDef = catalog.intents[key]
    if (!intentDef) continue
    for (const remId of intentDef.removeSteps) {
      removedIds.add(remId)
    }
  }

  const enrichedData: Partial<OperationDraft> = {
    ...context.data,
    nature: context.nature ?? context.data?.nature ?? context.seed?.nature,
    intents: activeIntents as OperationIntentKey[],
  }

  const { pointers } = computeOperationPointersAndNodes(
    enrichedData,
    activeIntents,
    catalog
  )

  const predicateCtx: IntentPredicateContext = {
    pointers,
    lookups: context.lookups,
  }

  const enrichedContext: StepResolutionContext<TIntentKey> = {
    ...context,
    intents: activeIntents,
    data: enrichedData,
    lookups: context.lookups,
    pointers,
  }

  return Array.from(stepMap.values())
    .filter((step) => !removedIds.has(step.id))
    .filter((step) => !step.skipWhen?.(enrichedContext))
    .filter((step) => !step.when || step.when(enrichedContext.data ?? {}, predicateCtx))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}

/**
 * Localiza qual etapa lógica é dona de um caminho de campo (ex.: "base.amount" -> "base.details").
 */
export function findStepIdForFieldPath<TIntentKey extends string>(
  fieldPath: string,
  steps: readonly StepDefinition<TIntentKey>[]
): string | undefined {
  for (const step of steps) {
    if (
      step.fields.some(
        (f) => f === fieldPath || fieldPath.startsWith(`${f}.`)
      )
    ) {
      return step.id
    }
  }
  return undefined
}

/**
 * Quando a etapa atual deixa de existir no fluxo ativo (ex.: `base.category` 4000 foi substituída
 * por `intent.create_category.basics` 4010 ao ativar CREATE_CATEGORY, ou vice-versa),
 * encontra declarativamente a etapa ativa de `order` mais próximo no catálogo.
 */
export function findClosestActiveStep<TIntentKey extends string>(
  previousStepId: string,
  activeSteps: readonly StepDefinition<TIntentKey>[],
  catalog: OperationStepCatalog<TIntentKey>
): StepDefinition<TIntentKey> | undefined {
  if (activeSteps.length === 0) return undefined
  if (!previousStepId) return activeSteps[0]

  const exactActive = activeSteps.find((s) => s.id === previousStepId)
  if (exactActive) return exactActive

  const intentKeys = Object.keys(catalog.intents) as TIntentKey[]
  const allKnownSteps: StepDefinition<TIntentKey>[] = [
    ...catalog.base,
    ...intentKeys.flatMap((k) => catalog.intents[k]?.addSteps ?? []),
  ]

  // Suporta IDs de sub-telas mobile (ex.: "base.details.amount" -> "base.details")
  const knownPrevious =
    allKnownSteps.find((s) => s.id === previousStepId) ??
    allKnownSteps.find((s) => previousStepId.startsWith(`${s.id}.`))

  if (!knownPrevious) {
    return activeSteps[0]
  }

  const targetOrder = knownPrevious.order

  return [...activeSteps].sort((a, b) => {
    const distA = Math.abs(a.order - targetOrder)
    const distB = Math.abs(b.order - targetOrder)
    if (distA !== distB) return distA - distB
    // Em caso de empate de distância, prefere a etapa à frente (>= targetOrder)
    const forwardA = a.order >= targetOrder ? 0 : 1
    const forwardB = b.order >= targetOrder ? 0 : 1
    if (forwardA !== forwardB) return forwardA - forwardB
    return a.order - b.order
  })[0]
}
