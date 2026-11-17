import { z } from "zod";
import { RecurrenceListItemSchema } from "./recurrence-item.schema";

export const RecurrenceProfileSchema = RecurrenceListItemSchema.extend({
    description: z.string().nullable().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
});

export type RecurrenceProfile = z.infer<typeof RecurrenceProfileSchema>;

