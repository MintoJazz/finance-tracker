import type { OperationDraft, OperationIntentKey } from "../../models/operation-input.schema"
import { sanitizeActiveIntents } from "../steps/interpreter"
import { STEP_ORDER } from "../steps/order"
import type { OperationStepCatalog } from "../steps/interpreter"
import type { SummaryCard, SummaryContext, SummaryRow } from "./types"

export function buildBaseSummaryCard(ctx: SummaryContext): SummaryCard {
  const nature = ctx.payload.nature ?? "PAY"
  const isPay = nature === "PAY"
  const amount = ctx.payload.base?.amount
  const amountCents = typeof amount === "number" ? Math.round(amount) : 0
  const dueDate = ctx.payload.base?.dueDate
  const description = ctx.payload.base?.description?.trim()

  const custody = ctx.lookups.custodies.find(
    (c) => c.id === ctx.payload.base?.custodyBalanceId
  )
  const cycle = ctx.lookups.creditCycles.find(
    (c) =>
      c.cardBalanceId === ctx.payload.base?.custodyBalanceId &&
      c.closingDate === ctx.payload.base?.competanceDate
  )
  const category = ctx.lookups.categories.find(
    (c) => c.id === ctx.payload.base?.categoryId
  )
  const subcategory = ctx.lookups.subcategories.find(
    (s) => s.id === ctx.payload.base?.subcategoryId
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
        text: cycle?.title ?? (cycle?.closingDate ? `Fatura ${cycle.closingDate}` : "Fatura Atual"),
      },
      stepId: "base.custody-cycle",
    })
  }

  const categoryPath =
    category && subcategory
      ? `${category.name} > ${subcategory.name}`
      : category?.name ?? subcategory?.name ?? null

  if (categoryPath) {
    rows.push({
      id: "base_category",
      label: "Categoria",
      value: {
        kind: "text",
        text: categoryPath,
      },
      stepId: "base.category",
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
        stepId: "base.details",
      },
    ],
  }
}

/**
 * Resolve a lista de cards cumulativos da revisão a partir do rascunho podado,
 * dos lookups e das intenções ativas sanitizadas.
 * - Garante determinismo: permutar a ordem de `activeIntents` produz os mesmos cards na mesma ordem.
 * - Aplica `decorateBase` em ordem alfabética das chaves de intenção.
 * - Ordena todos os cards finais por `order` ascendente e depois por `id`.
 */
export function resolveSummaryCards(
  ctx: SummaryContext,
  catalog: OperationStepCatalog<OperationIntentKey>
): readonly SummaryCard[] {
  const sanitizedIntents = sanitizeActiveIntents(
    ctx.activeIntents,
    catalog,
    ctx.payload
  )

  // 1. Gera o card base da operação
  let baseCard = buildBaseSummaryCard(ctx)

  // 2. Aplica `decorateBase` em ordem alfabética determinística das chaves
  const sortedIntentKeys = [...sanitizedIntents].sort()
  for (const key of sortedIntentKeys) {
    const def = catalog.intents[key]
    if (def?.summary?.decorateBase) {
      baseCard = def.summary.decorateBase(baseCard, ctx)
    }
  }

  // 3. Constrói os cards das intenções ativas
  const intentCards: SummaryCard[] = []
  for (const key of sortedIntentKeys) {
    const def = catalog.intents[key]
    if (def?.summary?.build) {
      const card = def.summary.build(ctx)
      if (card) {
        intentCards.push(card)
      }
    }
  }

  // 4. Junta o card base e os cards de intenções e ordena por order e id
  const allCards = [baseCard, ...intentCards]
  allCards.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  })

  return allCards
}

