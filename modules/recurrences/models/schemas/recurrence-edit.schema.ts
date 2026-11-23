import z from "zod";
import {
    RecurrenceClassificationBaseSchema,
    RecurrenceFormBaseSchema,
    refineClassification,
} from "./recurrence-form.schema";
import { looseCategoryDrafts } from "@/modules/categories/models/category-classification.schema";

/** Edição: renomear e trocar a categoria padrão (subcategoria) da recorrência. */
export const EditRecurrenceFormBaseSchema = RecurrenceFormBaseSchema.pick({
    name: true,
}).extend(RecurrenceClassificationBaseSchema.shape);

export const EditRecurrenceFormSchema =
    EditRecurrenceFormBaseSchema.superRefine(refineClassification);

export type EditRecurrenceFormValues = z.infer<typeof EditRecurrenceFormBaseSchema>;

export const EditRecurrenceInputSchema = EditRecurrenceFormBaseSchema.extend({
    id: z.number({ message: "Recorrência inválida" }).int().positive(),
}).superRefine(refineClassification);

export type EditRecurrenceInput = z.infer<typeof EditRecurrenceInputSchema>;

/** Passo único do wizard de edição: rascunhos sem exigir nome (validado no passo de criação). */
export const RecurrenceEditStepSchema = EditRecurrenceFormBaseSchema.extend(
    looseCategoryDrafts
).superRefine(refineClassification);
