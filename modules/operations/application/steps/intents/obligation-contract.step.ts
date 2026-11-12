import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"
import type { OperationIntentKey } from "../../../models/operation-input.schema"

export function createObligationContractStep(
  nature: "PAY" | "RECEIVE"
): StepDefinition<OperationIntentKey> {
  const isPay = nature === "PAY"
  const key: OperationIntentKey = isPay ? "PAY_OBLIGATION" : "RECEIVE_OBLIGATION"

  return {
    id: `intent.${key.toLowerCase()}.contract`,
    order: STEP_ORDER.OBLIGATION_CONTRACT,
    source: key,
    fields: [`${key}.agreementId`],
    skipWhen: ({ seed }) => seed?.agreementId !== undefined,
    validate: (data) => {
      const agreementId = data?.[key]?.agreementId

      if (!agreementId || agreementId <= 0) {
        return [
          {
            path: [key, "agreementId"],
            message: "Selecione um contrato ou cartão para prosseguir",
          },
        ]
      }
      return []
    },
  }
}
