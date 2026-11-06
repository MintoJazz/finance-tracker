import { STEP_ORDER } from "../../steps/order"
import { calculateInstallments } from "../../calculations/installments.calc"
import type { IntentSummary, SummaryCard, SummaryContext } from "../../summary/types"

export const installmentsSummary: IntentSummary = {
  order: STEP_ORDER.INTENT_PRIMARY, // 5000
  build(ctx: SummaryContext): SummaryCard | null {
    const totalAmount = ctx.payload.base?.amount
    const totalCents = typeof totalAmount === "number" ? Math.round(totalAmount) : 0
    const count = ctx.payload.DEMO_INSTALLMENTS?.count ?? 2
    const intervalDays = ctx.payload.DEMO_INSTALLMENTS?.intervalDays ?? 30

    const installments = calculateInstallments(totalCents, count)
    const firstInstallment = installments[0] ?? 0
    const formattedFirst = (firstInstallment / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return {
      id: "summary.intent.installments",
      source: "DEMO_INSTALLMENTS",
      order: STEP_ORDER.INTENT_PRIMARY,
      title: "Parcelar Valor",
      icon: "Layers",
      badge: {
        label: `${count} parcelas`,
        tone: "neutral",
      },
      rows: [
        {
          id: "installments_plan",
          label: "Plano de parcelamento",
          value: {
            kind: "text",
            text: `${count}x de R$ ${formattedFirst}`,
          },
          stepId: "intent.installments.config",
        },
        {
          id: "installments_interval",
          label: "Periodicidade",
          value: {
            kind: "text",
            text: `A cada ${intervalDays} dias`,
          },
          stepId: "intent.installments.config",
        },
      ],
      footer: [
        {
          id: "installments_total",
          label: "Total parcelado",
          value: totalCents > 0 ? { kind: "money", cents: totalCents } : null,
          stepId: "intent.installments.config",
        },
      ],
    }
  },
}

