import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const splitGroupSharesStep = {
  id: "intent.split_group.shares",
  order: STEP_ORDER.INTENT_SECONDARY, // 6100
  source: "DEMO_SPLIT_GROUP",
  fields: ["DEMO_SPLIT_GROUP.mode", "DEMO_SPLIT_GROUP.memberWeights"],
} as const satisfies StepDefinition<OperationIntentKey>

