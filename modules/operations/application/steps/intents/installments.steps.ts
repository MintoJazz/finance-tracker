import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const installmentsConfigStep = {
  id: "intent.installments.config",
  order: STEP_ORDER.INTENT_PRIMARY, // 5000
  source: "DEMO_INSTALLMENTS",
  fields: ["DEMO_INSTALLMENTS.count", "DEMO_INSTALLMENTS.intervalDays"],
} as const satisfies StepDefinition<OperationIntentKey>

