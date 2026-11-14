import type { OperationIntentKey } from "../../models/operation-input.schema"
import { BASE_STEPS } from "../steps/base"
import type { OperationStepCatalog } from "../steps/interpreter"
// import { chooseCardInvoiceIntent } from "./choose-card-invoice.intent"
import { createCategoryIntent } from "./create-category.intent"
import { createSubcategoryIntent } from "./create-subcategory.intent"
// import { createObligationIntent } from "./obligation.factory"

export const DISABLED_OPERATION_INTENTS = {
  // CHOOSE_CARD_INVOICE: chooseCardInvoiceIntent,
  // SETTLE_PAYABLE: createObligationIntent("PAY"),
  // SETTLE_RECEIVABLE: createObligationIntent("RECEIVE"),
} as const

export const OPERATION_INTENTS = {
  CREATE_CATEGORY: createCategoryIntent,
  CREATE_SUBCATEGORY: createSubcategoryIntent,
} as const

export const OPERATION_STEP_CATALOG: OperationStepCatalog<OperationIntentKey> = {
  base: BASE_STEPS,
  intents: OPERATION_INTENTS,
}

export const BASE_ONLY_OPERATION_CATALOG = OPERATION_STEP_CATALOG
