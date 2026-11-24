import type { WizardStep } from "@/components/wizard";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
  installmentCategoryStep,
  installmentNewCategoryStep,
  installmentNewEntitySteps,
  installmentNewSubcategoryStep,
  installmentSubcategoryStep,
} from "./classification.steps";
import { createInstallmentMainStep } from "./main.step";
import {
  createInstallmentCardStep,
  installmentBasicsStep,
  installmentDateStep,
  installmentValuesStep,
} from "./mobile.steps";
import { createInstallmentReviewStep } from "./review.step";

/** Mobile: um assunto por tela; cartão aparece dinamicamente em INVOICE e criar categoria/subcategoria adiciona 3 passos cada. */
export function buildInstallmentMobileSteps(
  options: InstallmentFormOptions
): WizardStep<InstallmentFormValues>[] {
  return [
    installmentBasicsStep,
    installmentCategoryStep(options),
    ...installmentNewEntitySteps("category", options),
    installmentSubcategoryStep(options),
    ...installmentNewEntitySteps("subcategory", options),
    installmentValuesStep,
    installmentDateStep,
    createInstallmentCardStep(options),
    createInstallmentReviewStep(options),
  ];
}

/** Desktop: 1 passo; criar categoria/subcategoria adiciona até 2 passos. */
export function buildInstallmentDesktopSteps(
  options: InstallmentFormOptions
): WizardStep<InstallmentFormValues>[] {
  return [
    createInstallmentMainStep(options),
    installmentNewCategoryStep(),
    installmentNewSubcategoryStep(options),
  ];
}
