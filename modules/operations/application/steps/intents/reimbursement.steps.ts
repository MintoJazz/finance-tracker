import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const reimbursementTargetsStep = {
  id: "intent.reimbursement.targets",
  order: STEP_ORDER.INTENT_REIMBURSEMENT, // 5100
  source: "DEMO_REIMBURSEMENT",
  fields: [
    "DEMO_REIMBURSEMENT.targetIds",
    "DEMO_REIMBURSEMENT.reimbursedAmount",
  ],
} as const satisfies StepDefinition<OperationIntentKey>

