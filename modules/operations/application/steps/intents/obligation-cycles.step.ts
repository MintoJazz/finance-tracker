import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"
import type { OperationIntentKey } from "../../../models/operation-input.schema"

export function createObligationCyclesStep(
  nature: "PAY" | "RECEIVE"
): StepDefinition<OperationIntentKey> {
  const isPay = nature === "PAY"
  const key: OperationIntentKey = isPay ? "SETTLE_PAYABLE" : "SETTLE_RECEIVABLE"

  return {
    id: `intent.${key.toLowerCase()}.cycles`,
    order: STEP_ORDER.OBLIGATION_CYCLES,
    source: key,
    fields: [`${key}.allocations`, "base.amount"],
    validate: (data) => {
      const allocations = data?.[key]?.allocations

      if (!allocations || allocations.length === 0) {
        return [
          {
            path: [key, "allocations"],
            message: isPay
              ? "Selecione ao menos um ciclo para pagar"
              : "Selecione ao menos um ciclo para receber",
          },
        ]
      }
      return []
    },
  }
}
