import type { WizardStep } from "@/components/wizard";
import {
  RecurrenceMainStepSchema,
  type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import {
  amountField,
  deadlineFields,
  frequencySelectField,
  nameField,
  natureField,
  startDateField,
} from "../../recurrence-form/fields";
import { createClassificationRow } from "../../recurrence-form/classification-fields";

/** Desktop: todos os campos da recorrência numa tela só. */
export function createRecurrenceMainStep(
  options: RecurrenceCategoryOptions
): WizardStep<RecurrenceFormValues> {
  return {
    id: "main",
    title: "Nova Recorrência",
    description:
      "Cadastre um compromisso financeiro recorrente para acompanhar pagamentos e projeções.",
    schema: RecurrenceMainStepSchema,
    fields: [
      natureField,
      nameField,
      createClassificationRow(options),
      amountField,
      { row: [frequencySelectField, startDateField] },
      ...deadlineFields,
    ],
  };
}
