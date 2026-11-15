import type { z } from "zod"
import { ChooseCardInvoiceIntentSliceSchema } from "./choose-card-invoice.schema"
import { CreateCategoryIntentSliceSchema } from "./create-category.schema"

export const OPERATION_INTENT_SCHEMAS = {
  CREATE_CATEGORY: CreateCategoryIntentSliceSchema,
  CREATE_SUBCATEGORY: CreateCategoryIntentSliceSchema,
  CHOOSE_CARD_INVOICE: ChooseCardInvoiceIntentSliceSchema,
} as const

export type OperationIntentKey = keyof typeof OPERATION_INTENT_SCHEMAS

export type OperationIntentSlices = {
  [K in OperationIntentKey]?: Partial<
    z.infer<(typeof OPERATION_INTENT_SCHEMAS)[K]>
  >
}

