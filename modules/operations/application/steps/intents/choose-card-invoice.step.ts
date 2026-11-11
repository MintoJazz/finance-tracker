import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const chooseCardInvoiceStep = {
  id: "intent.choose_card_invoice",
  order: STEP_ORDER.CHOOSE_CARD_INVOICE,
  source: "CHOOSE_CARD_INVOICE",
  fields: ["CHOOSE_CARD_INVOICE.month", "CHOOSE_CARD_INVOICE.year"],
  validate: (data) => {
    const slice = data.CHOOSE_CARD_INVOICE
    if (!slice) return []
    if (!slice.month || slice.month < 1 || slice.month > 12) {
      return [
        {
          path: ["CHOOSE_CARD_INVOICE", "month"],
          message: "Mês deve ser entre 1 e 12",
        },
      ]
    }
    if (!slice.year || slice.year < 2000 || slice.year > 2100) {
      return [
        {
          path: ["CHOOSE_CARD_INVOICE", "year"],
          message: "Ano da fatura inválido",
        },
      ]
    }
    return []
  },
} as const satisfies StepDefinition<OperationIntentKey>

