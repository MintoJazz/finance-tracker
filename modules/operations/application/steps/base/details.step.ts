import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const detailsBaseStep = {
  id: "base.details",
  order: STEP_ORDER.DETAILS,
  source: "BASE",
  fields: ["base.description", "base.dueDate"],
} as const satisfies StepDefinition
