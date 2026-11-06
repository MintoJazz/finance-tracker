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
import { installmentsStepViews } from "./intents/installments-step"
import { reimbursementStepViews } from "./intents/reimbursement-step"
import { settleCommitmentStepViews } from "./intents/settle-commitment-step"
import { splitGroupStepViews } from "./intents/split-group-step"

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
  "intent.settle.select": settleCommitmentStepViews,
  "intent.installments.config": installmentsStepViews,
  "intent.reimbursement.targets": reimbursementStepViews,
  "intent.split_group.shares": splitGroupStepViews,
} as const satisfies StepViewsCatalog<string, OperationDraft>

export type CatalogStepId = keyof typeof STEP_VIEWS_CATALOG

