import type { WizardStep } from "@/components/wizard";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import type { CategoryParentSummary } from "../../category-form/types";
import {
  categoryBasicsStep,
  createCategoryBasicsStep,
} from "./basics.step";
import { categoryColorStep } from "./color.step";
import { categoryIconStep, createCategoryIconStep } from "./icon.step";
import {
  categoryReviewStep,
  createCategoryReviewStep,
  CategoryReviewContent,
} from "./review.step";

export {
  categoryBasicsStep,
  createCategoryBasicsStep,
  categoryColorStep,
  categoryIconStep,
  createCategoryIconStep,
  categoryReviewStep,
  createCategoryReviewStep,
  CategoryReviewContent,
};

export const categoryWizardSteps: WizardStep<CategoryFormValues>[] = [
  categoryBasicsStep,
  categoryColorStep,
  categoryIconStep,
  categoryReviewStep,
];

export function getCategoryWizardSteps(options?: {
  parentCategory?: CategoryParentSummary | null;
  submitText?: string;
}): WizardStep<CategoryFormValues>[] {
  return [
    createCategoryBasicsStep(options?.parentCategory),
    categoryColorStep,
    createCategoryIconStep(options?.parentCategory),
    createCategoryReviewStep(options?.parentCategory, options?.submitText),
  ];
}

