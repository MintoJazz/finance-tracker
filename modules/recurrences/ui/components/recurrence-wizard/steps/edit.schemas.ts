import { RecurrenceFormBaseSchema } from "@/modules/recurrences/models/schemas/recurrence-form.schema";

export const recurrenceEditNameStepSchema = RecurrenceFormBaseSchema.pick({ name: true });
