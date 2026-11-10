import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const categoryBaseStep = {
  id: "base.category",
  order: STEP_ORDER.CATEGORY,
  source: "BASE",
  fields: ["base.categoryId"],
  validate: (data) => {
    if (!data?.base?.categoryId) {
      return [
        {
          path: ["base", "categoryId"],
          message: "Selecione uma categoria",
        },
      ]
    }
    return []
  },
} as const satisfies StepDefinition

