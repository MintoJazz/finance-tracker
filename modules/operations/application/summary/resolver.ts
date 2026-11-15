import type { OperationIntentKey } from "../../models/operation-input.schema"
import type { OperationStepCatalog } from "../steps/interpreter"
import { STEP_ORDER } from "../steps/order"
import type {
  SummaryCard,
  SummaryContext,
  SummaryRow,
} from "./types"

/**
 * Constrói o Resumo Geral (Fluxo Base), dedicado exclusivamente ao movimento financeiro
 * (Natureza, Valor Total, Vencimento, Descrição, Meio de Pagamento e Categoria).
 * É o card fixo no topo da revisão, independente de quais intenções estiverem ativas.
 */
export function buildBaseSummaryCard(ctx: SummaryContext): SummaryCard {
  const isPay = ctx.payload.nature !== "RECEIVE"
  const dueDate = ctx.payload.base?.dueDate || undefined
  const description = ctx.payload.base?.description?.trim() ?? ""

  const custodyId = ctx.payload.base?.custodyBalanceId
  const custody = ctx.lookups.custodies.find((c) => c.id === custodyId)

  const amountCents =
    typeof ctx.payload.base?.amount === "number" && ctx.payload.base.amount > 0
      ? Math.round(ctx.payload.base.amount)
      : 0

  const rows: SummaryRow[] = [
    {
      id: "base_amount",
      label: "Valor Total",
      value: amountCents > 0 ? { kind: "money", cents: amountCents } : null,
      stepId: "base.amount",
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

  let rootName: string | null = null
  let rootStepId = "base.category"
  let counterpartName: string | null = null
  let counterpartStepId = "base.subcategory"

  if (ctx.activeIntents.includes("CREATE_CATEGORY")) {
    rootName = ctx.payload.CREATE_CATEGORY?.name?.trim() || "Nova Categoria"
    rootStepId = "intent.create_category.basics"
  } else if (ctx.payload.base?.categoryId) {
    const found = ctx.lookups.categories.find(
      (c) => c.id === ctx.payload.base?.categoryId
    )
    if (found) {
      rootName = found.name
      rootStepId = "base.category"
    }
  }

  if (ctx.activeIntents.includes("CREATE_SUBCATEGORY")) {
    counterpartName =
      ctx.payload.CREATE_SUBCATEGORY?.name?.trim() || "Nova Subcategoria"
    counterpartStepId = "intent.create_subcategory.basics"
  } else if (ctx.payload.base?.subcategoryId) {
    const found = ctx.lookups.subcategories.find(
      (s) => s.id === ctx.payload.base?.subcategoryId
    )
    if (found) {
      counterpartName = found.name
      counterpartStepId = "base.subcategory"
    }
  }

  let categoryPath: string | null = null
  let categoryStepId = "base.category"

  if (rootName && counterpartName) {
    categoryPath = `${rootName} > ${counterpartName}`
    categoryStepId =
      rootStepId !== "base.category" ? rootStepId : counterpartStepId
  } else if (counterpartName) {
    categoryPath = counterpartName
    categoryStepId = counterpartStepId
  } else if (rootName) {
    categoryPath = rootName
    categoryStepId = rootStepId
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
    source: "BASE",
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
        stepId: "base.amount",
      },
    ],
  }
}

/**
 * Resolve a lista de cards cumulativos da revisão.
 * Padrão do projeto:
 * 1. Um card de Resumo Geral contendo exclusivamente o fluxo base (Lançamento Financeiro).
 * 2. Um card de resumo especializado para cada intenção ativa declarada no catálogo.
 * 3. Ordenação ascendente por `order` e desempate determinístico por `id`.
 */
export function resolveSummaryCards(
  ctx: SummaryContext,
  catalog: OperationStepCatalog<OperationIntentKey>
): readonly SummaryCard[] {
  const cards: SummaryCard[] = []

  // 1. Resumo Geral (Fluxo Base)
  const baseCard = buildBaseSummaryCard(ctx)
  if (baseCard) {
    cards.push(baseCard)
  }

  // 2. Card individual para cada intenção ativa
  for (const intentKey of ctx.activeIntents) {
    const intentDef = catalog.intents[intentKey]
    if (intentDef?.summaryCard) {
      const intentCard = intentDef.summaryCard(ctx)
      if (intentCard) {
        cards.push(intentCard)
      }
    }
  }

  cards.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  })

  return cards
}
