import type { WizardStep } from "@/components/wizard";
import {
  InstallmentBasicsStepSchema,
  InstallmentCardStepSchema,
  InstallmentDateStepSchema,
  InstallmentValuesStepSchema,
  type InstallmentFormValues,
} from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
  createCardPickerField,
  createNameField,
  firstDueDateField,
  purchaseDateField,
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

export const installmentDateStep: Step = {
  id: "payment",
  title: "Data",
  schema: InstallmentDateStepSchema,
  fields: [purchaseDateField, firstDueDateField],
};

/** Etapa dinâmica: só aparece quando o parcelamento é na fatura de um cartão. */
export function createInstallmentCardStep(
  options: InstallmentFormOptions
): Step {
  return {
    id: "card",
    title: "Cartão",
    when: (data) => data.type === "INVOICE",
    schema: InstallmentCardStepSchema,
    fields: [createCardPickerField(options)],
  };
}
