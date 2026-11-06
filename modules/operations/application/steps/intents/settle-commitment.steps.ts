import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const settleCommitmentSelectStep = {
  id: "intent.settle.select",
  order: STEP_ORDER.INTENT_ENTRY, // 1500
  source: "DEMO_SETTLE",
  fields: ["DEMO_SETTLE.commitmentId"],
} as const satisfies StepDefinition<OperationIntentKey>

