import z from "zod";

export const EntryTypeEnumSchema = z.enum([
    "DIRECT",
    "SETTLEMENT",
    "ACCRUAL",
    "TRANSFER",
    "ADJUSTMENT",
    "REVERSAL",
]);

export type EntryTypeEnum = z.infer<typeof EntryTypeEnumSchema>;

export const EntrySchema = z.object({
    id: z.number().int().positive().optional(),
    description: z.string().min(1, "Descrição é obrigatória"),
    date: z.date(),
    type: EntryTypeEnumSchema,
    reversesEntryId: z.number().int().positive().nullable().optional(),
    createdAt: z.date().optional(),
});

export type Entry = z.infer<typeof EntrySchema>;