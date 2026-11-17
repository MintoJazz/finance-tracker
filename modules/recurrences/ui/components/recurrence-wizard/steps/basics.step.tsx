import type { WizardStep } from "@/components/wizard";
import {
  RecurrenceFormBaseSchema,
  type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { createNameField, natureField } from "../../recurrence-form/fields";

export const recurrenceBasicsStepSchema = RecurrenceFormBaseSchema.pick({
  direction: true,
  name: true,
});

export const recurrenceBasicsStep: WizardStep<RecurrenceFormValues> = {
  id: "basics",
  title: "Tipo & Nome",
  schema: recurrenceBasicsStepSchema,
  fields: [
    natureField,
    createNameField("Ex: Aluguel, Internet...", "h-9 text-sm"),
  ],
};
