import { STEP_ORDER } from "../../steps/order"
import type { IntentSummary, SummaryCard, SummaryContext, SummaryRow } from "../../summary/types"

export const settleCommitmentSummary: IntentSummary = {
  order: STEP_ORDER.INTENT_ENTRY, // 1500
  build(ctx: SummaryContext): SummaryCard | null {
    const commitmentId = ctx.payload.DEMO_SETTLE?.commitmentId
    const commitment = ctx.lookups.commitments.find((c) => c.id === commitmentId)

    const amount = ctx.payload.base?.amount
    const amountCents = typeof amount === "number" ? Math.round(amount) : 0
    const originalCents = commitment?.suggestedAmountCents ?? 0

    const rows: SummaryRow[] = [
      {
        id: "settle_obligation",
        label: "Obrigação quitada",
        value: {
          kind: "text",
          text: commitment?.title ?? (commitmentId ? `Compromisso #${commitmentId}` : "—"),
        },
        stepId: "intent.settle.select",
      },
      {
        id: "settle_counterparty",
        label: "Contraparte",
        value: {
          kind: "text",
          text: commitment?.counterparty ?? "—",
        },
        stepId: "intent.settle.select",
      },
    ]

    if (originalCents > 0 && originalCents !== amountCents) {
      rows.push({
        id: "settle_original_amount",
        label: "Valor original do compromisso",
        value: {
          kind: "money",
          cents: originalCents,
        },
        stepId: "intent.settle.select",
      })
    }

    return {
      id: "summary.intent.settle",
      source: "DEMO_SETTLE",
      order: STEP_ORDER.INTENT_ENTRY,
      title: "Pagar Compromisso",
      icon: "CalendarCheck2",
      badge: {
        label: "Quitação",
        tone: "neutral",
      },
      rows,
      footer: [
        {
          id: "settle_settled_amount",
          label: "Valor abatido",
          value: amountCents > 0 ? { kind: "money", cents: amountCents } : null,
          stepId: "intent.settle.select",
        },
      ],
    }
  },
  decorateBase(card: SummaryCard, ctx: SummaryContext): SummaryCard {
    const commitmentId = ctx.payload.DEMO_SETTLE?.commitmentId
    const commitment = ctx.lookups.commitments.find((c) => c.id === commitmentId)

    if (!commitment) {
      return card
    }

    // Altera o título do card base para "Pagamento: <compromisso>"
    // e substitui a linha de categoria pela obrigação
    const updatedRows = (card.rows ?? []).map((row) => {
      if (row.id === "base_category") {
        return {
          ...row,
          label: "Compromisso associado",
          value: {
            kind: "text" as const,
            text: commitment.title,
          },
        }
      }
      return row
    })

    return {
      ...card,
      title: `Pagamento: ${commitment.title}`,
      rows: updatedRows,
    }
  },
}

