import type { WizardStep } from "@/components/wizard";
import {
  RecurrenceDeadlinesSchema,
  type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { deadlineFields } from "../../recurrence-form/fields";

export const recurrenceDeadlinesStep: WizardStep<RecurrenceFormValues> = {
  id: "deadlines",
  title: "Prazos de Vencimento",
  schema: RecurrenceDeadlinesSchema,
  fields: deadlineFields,
};
