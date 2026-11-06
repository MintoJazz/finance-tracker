import { STEP_ORDER } from "../../steps/order"
import { calculateReimbursement } from "../../calculations/reimbursement.calc"
import type { IntentSummary, SummaryCard, SummaryContext } from "../../summary/types"

export const reimbursementSummary: IntentSummary = {
  order: STEP_ORDER.INTENT_REIMBURSEMENT, // 5100
  build(ctx: SummaryContext): SummaryCard | null {
    const totalAmount = ctx.payload.base?.amount
    const totalCents = typeof totalAmount === "number" ? Math.round(totalAmount) : 0
    const reimbursedAmount = ctx.payload.DEMO_REIMBURSEMENT?.reimbursedAmount
    const reimbursedCents =
      typeof reimbursedAmount === "number" ? Math.round(reimbursedAmount) : 0

    const { userShareCents } = calculateReimbursement(totalCents, reimbursedCents)

    const targetIds = ctx.payload.DEMO_REIMBURSEMENT?.targetIds ?? []
    const targets = ctx.lookups.reimbursementTargets.filter((t) =>
      targetIds.includes(t.id)
    )

    const targetNames =
      targets.length > 0
        ? targets.map((t) => t.name).join(", ")
        : targetIds.length > 0
          ? `${targetIds.length} contato(s)`
          : "Nenhum selecionado"

    return {
      id: "summary.intent.reimbursement",
      source: "DEMO_REIMBURSEMENT",
      order: STEP_ORDER.INTENT_REIMBURSEMENT,
      title: "Cobrar Reembolso",
      icon: "HandCoins",
      badge: {
        label: `${targets.length || targetIds.length} alvo(s)`,
        tone: "neutral",
      },
      rows: [
        {
          id: "reimbursement_targets",
          label: "Quem vai pagar",
          value: {
            kind: "text",
            text: targetNames,
          },
          stepId: "intent.reimbursement.targets",
        },
        {
          id: "reimbursement_user_share",
          label: "Sua participação",
          value: totalCents > 0 ? { kind: "money", cents: userShareCents } : null,
          stepId: "intent.reimbursement.targets",
        },
      ],
      footer: [
        {
          id: "reimbursement_total",
          label: "Total a cobrar",
          value:
            reimbursedCents > 0
              ? { kind: "money", cents: reimbursedCents }
              : null,
          stepId: "intent.reimbursement.targets",
        },
      ],
    }
  },
}

