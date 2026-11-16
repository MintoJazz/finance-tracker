import type { OperationIntentKey } from "../../models/operation-input.schema"
import { BASE_STEPS } from "../steps/base"
import type { OperationStepCatalog } from "../steps/interpreter"
import { chooseCardInvoiceIntent } from "./choose-card-invoice.intent"
import { createCategoryIntent } from "./create-category.intent"
import { createSubcategoryIntent } from "./create-subcategory.intent"

export const DISABLED_OPERATION_INTENTS = {} as const

export const OPERATION_INTENTS = {
  CREATE_CATEGORY: createCategoryIntent,
  CREATE_SUBCATEGORY: createSubcategoryIntent,
  CHOOSE_CARD_INVOICE: chooseCardInvoiceIntent,
} as const

export const OPERATION_STEP_CATALOG: OperationStepCatalog<OperationIntentKey> = {
  base: BASE_STEPS,
  intents: OPERATION_INTENTS,
}

export const BASE_ONLY_OPERATION_CATALOG = OPERATION_STEP_CATALOG
