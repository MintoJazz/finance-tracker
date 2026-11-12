import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const amountBaseStep = {
  id: "base.amount",
  order: STEP_ORDER.AMOUNT,
  source: "BASE",
  fields: ["base.amount"],
  validate: (data) => {
    const amount = data?.base?.amount
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return [
        {
          path: ["base", "amount"],
          message: "O valor da operação deve ser maior que zero",
        },
      ]
    }
    return []
  },
} as const satisfies StepDefinition

