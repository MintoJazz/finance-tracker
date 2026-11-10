import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const custodyCycleBaseStep = {
  id: "base.custody-cycle",
  order: STEP_ORDER.CUSTODY_CYCLE,
  source: "BASE",
  fields: ["base.competanceDate"],
  when: (data) =>
    data?.nature !== "RECEIVE" && data?.base?.custodyType === "CREDIT",
  validate: (data) => {
    if (!data?.base?.competanceDate) {
      return [
        {
          path: ["base", "competanceDate"],
          message: "Selecione a fatura do cartão",
        },
      ]
    }
    return []
  },
} as const satisfies StepDefinition
