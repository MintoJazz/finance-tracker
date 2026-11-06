import { SplitGroupSliceSchema } from "../../models/intents/split-group.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { splitGroupSharesStep } from "../steps/intents/split-group.steps"
import { splitGroupSummary } from "./summaries/split-group.summary"
import type { IntentDefinition } from "./types"

export const splitGroupIntent = {
  key: "DEMO_SPLIT_GROUP",
  schema: SplitGroupSliceSchema,
  addSteps: [splitGroupSharesStep],
  removeSteps: [],
  excludes: [],
  requires: ["DEMO_REIMBURSEMENT"],
  offer: {
    at: ["intent.reimbursement.targets", "intent.split_group.shares"],
    label: "Ratear grupo",
    description:
      "Personaliza a divisão do reembolso entre os membros do grupo selecionado.",
    icon: "Users",
    when: (data) =>
      (data?.DEMO_REIMBURSEMENT?.targetIds ?? []).some((id) =>
        id.startsWith("group_")
      ),
  },
  summary: splitGroupSummary,
} as const satisfies IntentDefinition<OperationIntentKey>

