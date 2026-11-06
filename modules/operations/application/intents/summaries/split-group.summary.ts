import { STEP_ORDER } from "../../steps/order"
import { calculateGroupShares } from "../../calculations/split.calc"
import type {
  IntentSummary,
  SummaryCard,
  SummaryContext,
  SummaryRow,
  SummarySection,
} from "../../summary/types"

export const splitGroupSummary: IntentSummary = {
  order: STEP_ORDER.INTENT_SECONDARY, // 6100
  build(ctx: SummaryContext): SummaryCard | null {
    const targetIds = new Set(ctx.payload.DEMO_REIMBURSEMENT?.targetIds ?? [])
    const selectedGroups = ctx.lookups.reimbursementTargets.filter(
      (t) => t.type === "GROUP" && targetIds.has(t.id)
    )

    if (selectedGroups.length === 0) {
      return null
    }

    const mode = ctx.payload.DEMO_SPLIT_GROUP?.mode ?? "EQUAL"
    const weights = ctx.payload.DEMO_SPLIT_GROUP?.memberWeights ?? {}
    const totalReimbursedCents =
      typeof ctx.payload.DEMO_REIMBURSEMENT?.reimbursedAmount === "number"
        ? Math.round(ctx.payload.DEMO_REIMBURSEMENT.reimbursedAmount)
        : 0

    // Divide o valor do reembolso entre os grupos selecionados (se houver mais de 1 grupo)
    const perGroupCents =
      selectedGroups.length > 0
        ? Math.floor(totalReimbursedCents / selectedGroups.length)
        : 0

    const sections: SummarySection[] = selectedGroups.map((group, groupIdx) => {
      const groupShare =
        groupIdx === 0
          ? perGroupCents + (totalReimbursedCents - perGroupCents * selectedGroups.length)
          : perGroupCents

      const members = group.members ?? []
      const memberIds = members.map((m) => m.id)
      const shares = calculateGroupShares(groupShare, memberIds, mode, weights)

      const memberRows: SummaryRow[] = members.map((member) => ({
        id: `split_${group.id}_${member.id}`,
        label: member.name,
        value: {
          kind: "money",
          cents: shares[member.id] ?? 0,
        },
        stepId: "intent.split_group.shares",
      }))

      return {
        id: group.id,
        title: group.name,
        subtitle:
          mode === "WEIGHTS"
            ? "Divisão por pesos proporcionais"
            : `Divisão igualitária (${members.length} membros)`,
        rows: memberRows,
        footer: [
          {
            id: `split_group_total_${group.id}`,
            label: `Subtotal de ${group.name}`,
            value: { kind: "money", cents: groupShare },
            stepId: "intent.split_group.shares",
          },
        ],
      }
    })

    return {
      id: "summary.intent.split_group",
      source: "DEMO_SPLIT_GROUP",
      order: STEP_ORDER.INTENT_SECONDARY,
      title: "Rateio dos Grupos",
      icon: "Users",
      badge: {
        label: mode === "WEIGHTS" ? "Por Pesos" : "Igualitário",
        tone: "neutral",
      },
      sections,
    }
  },
}

