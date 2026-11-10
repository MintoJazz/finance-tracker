import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const subcategoryBaseStep = {
  id: "base.subcategory",
  order: STEP_ORDER.SUBCATEGORY,
  source: "BASE",
  fields: ["base.subcategoryId"],
  when: (_data, ctx) => Boolean(ctx.pointers.categoryRoot),
} as const satisfies StepDefinition

