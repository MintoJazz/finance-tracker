import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const custodyBaseStep = {
  id: "base.custody",
  order: STEP_ORDER.CUSTODY,
  source: "BASE",
  fields: ["base.custodyBalanceId", "base.custodyType"],
  validate: (data) => {
    if (data?.nature === "RECEIVE" && data?.base?.custodyType === "CREDIT") {
      return [
        {
          path: ["base", "custodyType"],
          message:
            "Cartão de crédito não é permitido em operações de recebimento",
        },
      ]
    }
    return []
  },
} as const satisfies StepDefinition

