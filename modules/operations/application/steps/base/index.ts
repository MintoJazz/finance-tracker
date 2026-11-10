import { categoryBaseStep } from "./category.step"
import { custodyBaseStep } from "./custody.step"
import { detailsBaseStep } from "./details.step"
import { entryBaseStep } from "./entry.step"
import { reviewBaseStep } from "./review.step"
import { subcategoryBaseStep } from "./subcategory.step"

export {
  entryBaseStep,
  custodyBaseStep,
  detailsBaseStep,
  categoryBaseStep,
  subcategoryBaseStep,
  reviewBaseStep,
}

export const BASE_STEPS = [
  entryBaseStep,
  custodyBaseStep,
  detailsBaseStep,
  categoryBaseStep,
  subcategoryBaseStep,
  reviewBaseStep,
] as const

export type BaseStepId = (typeof BASE_STEPS)[number]["id"]

