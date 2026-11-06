import { ReimbursementSliceSchema } from "../../models/intents/reimbursement.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { reimbursementTargetsStep } from "../steps/intents/reimbursement.steps"
import { reimbursementSummary } from "./summaries/reimbursement.summary"
import type { IntentDefinition } from "./types"

export const reimbursementIntent = {
  key: "DEMO_REIMBURSEMENT",
  schema: ReimbursementSliceSchema,
  addSteps: [reimbursementTargetsStep],
  removeSteps: [],
  excludes: [],
  requires: [],
  offer: {
    at: ["base.details", "intent.reimbursement.targets"],
    label: "Pedir reembolso",
    description:
      "Registra contatos ou grupos que vão ressarcir parte ou o total desta operação.",
    icon: "HandCoins",
    when: (data) => (data?.nature ?? "PAY") === "PAY",
  },
  summary: reimbursementSummary,
} as const satisfies IntentDefinition<OperationIntentKey>
