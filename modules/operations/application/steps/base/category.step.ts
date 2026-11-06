import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const categoryBaseStep = {
  id: "base.category",
  order: STEP_ORDER.CATEGORY,
  source: "BASE",
  fields: ["base.categoryId"],
} as const satisfies StepDefinition

