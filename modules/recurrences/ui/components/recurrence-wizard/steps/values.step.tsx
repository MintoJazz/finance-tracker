import type { WizardStep } from "@/components/wizard";
import {
  RecurrenceFormBaseSchema,
  type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import {
  amountField,
  frequencyPillsField,
  startDateField,
} from "../../recurrence-form/fields";

/**
 * Inclui os campos de prazo para que o ajuste automático ao trocar a frequência
 * (ex.: semanal usa 0–6) seja preservado ao avançar para o passo seguinte.
 */
export const recurrenceValuesStepSchema = RecurrenceFormBaseSchema.pick({
  amount: true,
  frequency: true,
  startDate: true,
  dueDay: true,
  closingDay: true,
  dueMonth: true,
  closingMonth: true,
});

export const recurrenceValuesStep: WizardStep<RecurrenceFormValues> = {
  id: "values",
  title: "Valores & Período",
  schema: recurrenceValuesStepSchema,
  fields: [
    amountField,
    frequencyPillsField,
    { ...startDateField, label: "Data de início" },
  ],
};
