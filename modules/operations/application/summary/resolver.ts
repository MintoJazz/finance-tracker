import type { OperationIntentKey } from "../../models/operation-input.schema"
import { compileOperationPlan } from "../plan/compiler"
import type {
  CreateCategoryBalanceAction,
  CreateDirectEntryAction,
  EntityRef,
  OperationExecutionPlan,
  OperationPlanNode,
} from "../plan/types"
import type { OperationStepCatalog } from "../steps/interpreter"
import { STEP_ORDER } from "../steps/order"
import type {
  OperationLookupData,
  SummaryCard,
  SummaryContext,
  SummaryRow,
} from "./types"

interface ResolvedCategoryDisplay {
  readonly name: string
  readonly color: string | null
  readonly icon: string | null
  readonly stepId: string
  readonly isFromIntent: boolean
}

function resolveCategoryDisplay<TIntentKey extends string>(
  ref: EntityRef | null | undefined,
  plan: OperationExecutionPlan<TIntentKey>,
  lookups: OperationLookupData
): ResolvedCategoryDisplay | null {
  if (!ref) return null

  if (ref.kind === "existing") {
    const rootCat = lookups.categories.find((c) => c.id === ref.id)
    if (rootCat) {
      return {
        name: rootCat.name,
        color: rootCat.color ?? null,
        icon: rootCat.icon ?? null,
        stepId: "base.category",
        isFromIntent: false,
      }
    }

    const subCat = lookups.subcategories.find((s) => s.id === ref.id)
    if (subCat) {
      return {
        name: subCat.name,
        color: subCat.color ?? null,
        icon: subCat.icon ?? null,
        stepId: "base.subcategory",
        isFromIntent: false,
      }
    }

    return null
  }

  const node = plan.nodes.find((n) => n.id === ref.nodeId)
  if (node && node.action.type === "CREATE_CATEGORY_BALANCE") {
    return {
      name: node.action.name,
      color: node.action.color,
      icon: node.action.icon,
      stepId: node.stepId ?? "base.category",
      isFromIntent: true,
    }
  }

  return null
}

function buildDirectEntrySummaryCard<TIntentKey extends string>(
  node: OperationPlanNode<TIntentKey>,
  action: CreateDirectEntryAction,
  plan: OperationExecutionPlan<TIntentKey>,
  lookups: OperationLookupData
): SummaryCard {
  const isPay = action.nature === "PAY"
  const amountCents = action.amountCents > 0 ? action.amountCents : 0
  const dueDate = action.dueDate || undefined
  const description = action.description.trim()

  const custodyId =
    action.custody?.kind === "existing" ? action.custody.id : undefined
  const custody = lookups.custodies.find((c) => c.id === custodyId)
  const cycle = lookups.creditCycles.find(
    (c) =>
      c.cardBalanceId === custodyId &&
      c.closingDate === action.competanceDate
  )

  const rows: SummaryRow[] = [
    {
      id: "base_amount",
      label: "Valor Total",
      value: amountCents > 0 ? { kind: "money", cents: amountCents } : null,
      stepId: "base.details",
    },
    {
      id: "base_due_date",
      label: "Vencimento",
      value: dueDate ? { kind: "date", iso: dueDate } : null,
      stepId: "base.details",
    },
    {
      id: "base_description",
      label: "Descrição",
      value: {
        kind: "text",
        text: description || "Sem descrição",
      },
      stepId: "base.details",
    },
    {
      id: "base_custody",
      label: "Meio de Pagamento",
      value: {
        kind: "text",
        text: custody?.name ?? "Não selecionado",
      },
      stepId: "base.custody",
    },
  ]

  if (custody?.type === "CREDIT") {
    rows.push({
      id: "base_cycle",
      label: "Fatura",
      value: {
        kind: "text",
        text:
          cycle?.title ??
          (cycle?.closingDate
            ? `Fatura ${cycle.closingDate}`
            : "Fatura Atual"),
      },
      stepId: "base.custody-cycle",
    })
  }

  const rootDisplay = resolveCategoryDisplay(
    plan.pointers.categoryRoot,
    plan,
    lookups
  )
  const counterpartDisplay = resolveCategoryDisplay(
    action.counterpart,
    plan,
    lookups
  )

  const isSameRef =
    plan.pointers.categoryRoot &&
    action.counterpart &&
    plan.pointers.categoryRoot.kind === action.counterpart.kind &&
    (plan.pointers.categoryRoot.kind === "existing"
      ? plan.pointers.categoryRoot.id ===
        (action.counterpart as { kind: "existing"; id: number }).id
      : plan.pointers.categoryRoot.nodeId ===
        (action.counterpart as { kind: "node"; nodeId: string }).nodeId)

  let categoryPath: string | null = null
  let categoryStepId = "base.category"

  if (rootDisplay && counterpartDisplay && !isSameRef) {
    categoryPath = `${rootDisplay.name} > ${counterpartDisplay.name}`
    categoryStepId = rootDisplay.isFromIntent
      ? rootDisplay.stepId
      : counterpartDisplay.isFromIntent
        ? counterpartDisplay.stepId
        : "base.category"
  } else if (counterpartDisplay) {
    categoryPath = counterpartDisplay.name
    categoryStepId = counterpartDisplay.isFromIntent
      ? counterpartDisplay.stepId
      : "base.category"
  } else if (rootDisplay) {
    categoryPath = rootDisplay.name
    categoryStepId = rootDisplay.isFromIntent
      ? rootDisplay.stepId
      : "base.category"
  }

  if (categoryPath) {
    rows.push({
      id: "base_category",
      label: "Categoria",
      value: {
        kind: "text",
        text: categoryPath,
      },
      stepId: categoryStepId,
    })
  }

  return {
    id: "summary.base",
    source: node.source as "BASE" | OperationIntentKey,
    order: STEP_ORDER.ENTRY, // 1000 - Âncora principal sempre no topo
    title: "Lançamento Financeiro",
    icon: isPay ? "ArrowUpRight" : "ArrowDownLeft",
    badge: {
      label: isPay ? "Saída" : "Entrada",
      tone: isPay ? "danger" : "success",
    },
    rows,
    footer: [
      {
        id: "base_total",
        label: "Total no rodapé",
        value: amountCents > 0 ? { kind: "money", cents: amountCents } : null,
        stepId: "base.details",
      },
    ],
  }
}

function buildCategoryBalanceSummaryCard<TIntentKey extends string>(
  node: OperationPlanNode<TIntentKey>,
  action: CreateCategoryBalanceAction,
  plan: OperationExecutionPlan<TIntentKey>,
  lookups: OperationLookupData
): SummaryCard {
  const isSubcategory =
    action.parent !== null || node.id === "intent.create_subcategory"

  if (!isSubcategory) {
    return {
      id: `summary.${node.id}`,
      source: node.source as "BASE" | OperationIntentKey,
      order: node.order,
      title: "Criar Categoria",
      icon: "FolderPlus",
      badge: {
        label: "Nova",
        tone: "neutral",
      },
      visualItem: {
        title: action.name,
        subtitle: "Categoria raiz",
        icon: action.icon || "Folder",
        color: action.color || "#10B981",
        stepId: node.stepId,
      },
    }
  }

  const parentDisplay = resolveCategoryDisplay(action.parent, plan, lookups)
  const parentName = parentDisplay?.name || "Categoria Base"
  const inheritedColor = action.color || parentDisplay?.color || "#10B981"

  return {
    id: `summary.${node.id}`,
    source: node.source as "BASE" | OperationIntentKey,
    order: node.order,
    title: "Criar Subcategoria",
    icon: "FolderPlus",
    badge: {
      label: "Nova",
      tone: "neutral",
    },
    visualItem: {
      title: action.name,
      subtitle: `Subcategoria • ${parentName}`,
      icon: action.icon || "Folder",
      color: inheritedColor,
      stepId: node.stepId,
    },
  }
}

/**
 * Resolve a lista de cards cumulativos da revisão diretamente a partir do
 * `OperationExecutionPlan` (DAG) compilado.
 * - Fonte única de verdade: os cards da UI espelham exatamente os nós e ponteiros do DAG.
 * - Ordena todos os cards finais por `order` ascendente e depois por `id`.
 */
export function resolveSummaryCards(
  ctx: SummaryContext,
  catalog: OperationStepCatalog<OperationIntentKey>
): readonly SummaryCard[] {
  const plan = compileOperationPlan(ctx.payload, catalog, ctx.activeIntents)

  const cards: SummaryCard[] = []

  for (const node of plan.nodes) {
    switch (node.action.type) {
      case "CREATE_DIRECT_ENTRY": {
        cards.push(
          buildDirectEntrySummaryCard(node, node.action, plan, ctx.lookups)
        )
        break
      }
      case "CREATE_CATEGORY_BALANCE": {
        cards.push(
          buildCategoryBalanceSummaryCard(node, node.action, plan, ctx.lookups)
        )
        break
      }
    }
  }

  cards.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  })

  return cards
}
