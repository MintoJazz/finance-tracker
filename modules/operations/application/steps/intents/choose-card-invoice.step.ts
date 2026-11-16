import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition, StepValidationIssue } from "../types"

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const chooseCardInvoiceStep = {
  id: "intent.choose_card_invoice",
  order: STEP_ORDER.CHOOSE_CARD_INVOICE,
  source: "CHOOSE_CARD_INVOICE",
  fields: [
    "CHOOSE_CARD_INVOICE.from",
    "CHOOSE_CARD_INVOICE.to",
    "CHOOSE_CARD_INVOICE.dueDate",
    "CHOOSE_CARD_INVOICE.label",
    "base.competanceDate",
  ],
  validate: (data) => {
    const slice = data.CHOOSE_CARD_INVOICE
    if (!slice) return []
    const issues: StepValidationIssue[] = []
    if (!slice.from || !ISO_DATE_RE.test(slice.from)) {
      issues.push({
        path: ["CHOOSE_CARD_INVOICE", "from"],
        message: "Selecione uma fatura válida",
      })
    }
    if (!slice.to || !ISO_DATE_RE.test(slice.to)) {
      issues.push({
        path: ["CHOOSE_CARD_INVOICE", "to"],
        message: "Selecione uma fatura válida",
      })
    }
    if (!slice.dueDate || !ISO_DATE_RE.test(slice.dueDate)) {
      issues.push({
        path: ["CHOOSE_CARD_INVOICE", "dueDate"],
        message: "Data de vencimento da fatura inválida",
      })
    }
    if (!slice.label?.trim()) {
      issues.push({
        path: ["CHOOSE_CARD_INVOICE", "label"],
        message: "Selecione uma fatura válida",
      })
    }
    return issues
  },
} as const satisfies StepDefinition<OperationIntentKey>

