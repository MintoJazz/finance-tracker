import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const reviewBaseStep = {
  id: "base.review",
  order: STEP_ORDER.REVIEW,
  source: "BASE",
  fields: [],
} as const satisfies StepDefinition

