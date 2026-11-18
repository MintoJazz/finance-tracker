import z from "zod";

export const ArchiveRecurrenceSchema = z.object({
    id: z.number().int().positive("Recorrência inválida"),
});
export type ArchiveRecurrenceInput = z.infer<typeof ArchiveRecurrenceSchema>;

export const RestoreRecurrenceSchema = z.object({
    id: z.number().int().positive("Recorrência inválida"),
});
export type RestoreRecurrenceInput = z.infer<typeof RestoreRecurrenceSchema>;

export const SetRecurrenceActiveSchema = z.object({
    id: z.number().int().positive("Recorrência inválida"),
    isActive: z.boolean(),
});
export type SetRecurrenceActiveInput = z.infer<typeof SetRecurrenceActiveSchema>;
