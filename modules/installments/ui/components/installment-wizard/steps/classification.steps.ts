import type { WizardStep } from "@/components/wizard";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
  createRecurrenceCategoryStep,
  createRecurrenceNewCategoryStep,
  createRecurrenceNewSubcategoryStep,
  createRecurrenceSubcategoryStep,
} from "@/modules/recurrences/ui/components/recurrence-wizard/steps/classification.step";
import { createRecurrenceNewEntitySteps } from "@/modules/recurrences/ui/components/recurrence-wizard/steps/new-entity.steps";

/**
 * Passos de categoria/subcategoria (existente ou nova) reaproveitados de recorrências:
 * os dados do form têm exatamente os mesmos quatro campos de classificação.
 */
type Step = WizardStep<InstallmentFormValues>;
const as = (s: unknown) => s as Step;
const asList = (s: unknown) => s as Step[];

export const installmentCategoryStep = (o: InstallmentFormOptions) =>
  as(createRecurrenceCategoryStep(o));
export const installmentSubcategoryStep = (o: InstallmentFormOptions) =>
  as(createRecurrenceSubcategoryStep(o));
export const installmentNewCategoryStep = () =>
  as(createRecurrenceNewCategoryStep());
export const installmentNewSubcategoryStep = (o: InstallmentFormOptions) =>
  as(createRecurrenceNewSubcategoryStep(o));
export const installmentNewEntitySteps = (
  entity: "category" | "subcategory",
  o: InstallmentFormOptions
) => asList(createRecurrenceNewEntitySteps(entity, o));
