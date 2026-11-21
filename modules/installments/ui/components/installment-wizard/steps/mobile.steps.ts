import type { WizardStep } from "@/components/wizard";
import {
  InstallmentBasicsStepSchema,
  InstallmentPaymentStepSchema,
  InstallmentValuesStepSchema,
  type InstallmentFormValues,
} from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
  createNameField,
  createPaymentRow,
  totalAmountField,
  totalInstallmentsFieldWithHint,
  typeField,
} from "../../installment-form/fields";

type Step = WizardStep<InstallmentFormValues>;

export const installmentBasicsStep: Step = {
  id: "basics",
  title: "Forma de pagamento & Nome",
  schema: InstallmentBasicsStepSchema,
  fields: [
    typeField,
    createNameField("Ex: iPhone, Geladeira...", "h-9 text-sm"),
  ],
};

export const installmentValuesStep: Step = {
  id: "values",
  title: "Valor & Parcelas",
  schema: InstallmentValuesStepSchema,
  fields: [totalAmountField, totalInstallmentsFieldWithHint],
};

export function createInstallmentPaymentStep(
  options: InstallmentFormOptions
): Step {
  return {
    id: "payment",
    title: "Data & Cartão",
    schema: InstallmentPaymentStepSchema,
    fields: [createPaymentRow(options)],
  };
}
