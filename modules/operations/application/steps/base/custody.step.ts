import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const custodyBaseStep = {
  id: "base.custody",
  order: STEP_ORDER.CUSTODY,
  source: "BASE",
  fields: ["base.custodyBalanceId", "base.custodyType"],
} as const satisfies StepDefinition

