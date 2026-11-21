import type { WizardStep } from "@/components/wizard";
import {
  InstallmentMainStepSchema,
  type InstallmentFormValues,
} from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import { installmentClassificationRow } from "../../installment-form/classification-fields";
import {
  compactTypeField,
  createPaymentRow,
  nameField,
  valuesRow,
} from "../../installment-form/fields";

/** Desktop: todos os campos do parcelamento numa tela só. */
export function createInstallmentMainStep(
  options: InstallmentFormOptions
): WizardStep<InstallmentFormValues> {
  return {
    id: "main",
    title: "Novo Parcelamento",
    description:
      "Cadastre uma compra parcelada para acompanhar as parcelas e o que ainda falta pagar.",
    schema: InstallmentMainStepSchema,
    fields: [
      compactTypeField,
      nameField,
      valuesRow,
      createPaymentRow(options),
      installmentClassificationRow(options),
    ],
  };
}
