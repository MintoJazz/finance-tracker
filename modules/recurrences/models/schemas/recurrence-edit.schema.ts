import z from "zod";
import {
    RecurrenceCategoryDraftSchema,
    RecurrenceClassificationBaseSchema,
    RecurrenceFormBaseSchema,
    refineClassification,
} from "./recurrence-form.schema";

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
const LooseDraftSchema = RecurrenceCategoryDraftSchema.extend({ name: z.string() });

export const RecurrenceEditStepSchema = EditRecurrenceFormBaseSchema.extend({
    newCategory: LooseDraftSchema.nullable().optional(),
    newSubcategory: LooseDraftSchema.nullable().optional(),
}).superRefine(refineClassification);
