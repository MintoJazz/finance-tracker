import type { WizardStep } from "@/components/wizard";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { recurrenceBasicsStep } from "./basics.step";
import { recurrenceValuesStep } from "./values.step";
import { recurrenceDeadlinesStep } from "./deadlines.step";
import { createRecurrenceReviewStep } from "./review.step";
import { createRecurrenceMainStep } from "./main.step";
import {
  createRecurrenceCategoryStep,
  createRecurrenceNewCategoryStep,
  createRecurrenceNewSubcategoryStep,
  createRecurrenceSubcategoryStep,
} from "./classification.step";
import { createRecurrenceNewEntitySteps } from "./new-entity.steps";

export * from "./basics.step";
export * from "./values.step";
export * from "./deadlines.step";
export * from "./review.step";
export * from "./main.step";
export * from "./classification.step";
export * from "./new-entity.steps";
export * from "./edit.steps";

/** Mobile: um assunto por tela; criar categoria/subcategoria adiciona 3 passos cada (nome, cor, ícone). */
export function buildRecurrenceMobileSteps(
  options: RecurrenceCategoryOptions
): WizardStep<RecurrenceFormValues>[] {
  return [
    recurrenceBasicsStep,
    createRecurrenceCategoryStep(options),
    ...createRecurrenceNewEntitySteps("category", options),
    createRecurrenceSubcategoryStep(options),
    ...createRecurrenceNewEntitySteps("subcategory", options),
    recurrenceValuesStep,
    recurrenceDeadlinesStep,
    createRecurrenceReviewStep(options),
  ];
}

/** Desktop: 1 passo; criar categoria/subcategoria adiciona até 2 passos. */
export function buildRecurrenceDesktopSteps(
  options: RecurrenceCategoryOptions
): WizardStep<RecurrenceFormValues>[] {
  return [
    createRecurrenceMainStep(options),
    createRecurrenceNewCategoryStep(),
    createRecurrenceNewSubcategoryStep(options),
  ];
}
