import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViewsCatalog } from "../types"
import { categoryStepViews } from "./base/category-step"
import { custodyCycleStepViews } from "./base/custody-cycle-step"
import { custodyStepViews } from "./base/custody-step"
import { detailsStepViews } from "./base/details-step"
import { entryStepViews } from "./base/entry-step"
import { reviewStepViews } from "./base/review-step"
import { subcategoryStepViews } from "./base/subcategory-step"
import {
  createCategoryStepViewsMap,
  createSubcategoryStepViewsMap,
} from "./intents/category-creation-steps"

export const STEP_VIEWS_CATALOG = {
  "base.entry": entryStepViews,
  "base.custody": custodyStepViews,
  "base.custody-cycle": custodyCycleStepViews,
  "base.details": detailsStepViews,
  "base.category": categoryStepViews,
  "base.subcategory": subcategoryStepViews,
  "base.review": reviewStepViews,
  ...createCategoryStepViewsMap,
  ...createSubcategoryStepViewsMap,
} as const satisfies StepViewsCatalog<string, OperationDraft>

export type CatalogStepId = keyof typeof STEP_VIEWS_CATALOG
