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
  createInstallmentPaymentStep,
  installmentBasicsStep,
  installmentValuesStep,
} from "./mobile.steps";
import { createInstallmentReviewStep } from "./review.step";

/** Mobile: um assunto por tela; criar categoria/subcategoria adiciona 3 passos cada (nome, cor, ícone). */
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
    createInstallmentPaymentStep(options),
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
