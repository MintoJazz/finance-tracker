import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViewsCatalog } from "../types"
import { amountStepViews } from "./base/amount-step"
import { categoryStepViews } from "./base/category-step"
import { custodyStepViews } from "./base/custody-step"
import { detailsStepViews } from "./base/details-step"
import { entryStepViews } from "./base/entry-step"
import { reviewStepViews } from "./base/review-step"
import { subcategoryStepViews } from "./base/subcategory-step"
import {
  createCategoryStepViewsMap,
  createSubcategoryStepViewsMap,
} from "./intents/category-creation-steps"
import { cardInvoiceStepViews } from "./intents/card-invoice-step"
import { obligationStepViewsMap } from "./intents/obligation-steps"

export const STEP_VIEWS_CATALOG = {
  "base.entry": entryStepViews,
  "base.details": detailsStepViews,
  "base.custody": custodyStepViews,
  "intent.choose_card_invoice": cardInvoiceStepViews,
  "base.amount": amountStepViews,
  "base.category": categoryStepViews,
  "base.subcategory": subcategoryStepViews,
  "base.review": reviewStepViews,
  ...createCategoryStepViewsMap,
  ...createSubcategoryStepViewsMap,
  ...obligationStepViewsMap,
} as const satisfies StepViewsCatalog<string, OperationDraft>

export type CatalogStepId = keyof typeof STEP_VIEWS_CATALOG
