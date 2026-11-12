import { amountBaseStep } from "./amount.step"
import { categoryBaseStep } from "./category.step"
import { custodyBaseStep } from "./custody.step"
import { detailsBaseStep } from "./details.step"
import { entryBaseStep } from "./entry.step"
import { reviewBaseStep } from "./review.step"
import { subcategoryBaseStep } from "./subcategory.step"

export {
  entryBaseStep,
  detailsBaseStep,
  custodyBaseStep,
  amountBaseStep,
  categoryBaseStep,
  subcategoryBaseStep,
  reviewBaseStep,
}

export const BASE_STEPS = [
  entryBaseStep,
  detailsBaseStep,
  custodyBaseStep,
  amountBaseStep,
  categoryBaseStep,
  subcategoryBaseStep,
  reviewBaseStep,
] as const

export type BaseStepId = (typeof BASE_STEPS)[number]["id"]

