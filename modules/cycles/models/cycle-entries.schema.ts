import { z } from "zod";

export const CycleMovementItemSchema = z.object({
    movementId: z.number().int().positive(),
    balanceId: z.number().int().positive(),
    balanceName: z.string(),
    amount: z.number().int(),
    direction: z.enum(["CREDIT", "DEBIT"]),
});

export type CycleMovementItem = z.infer<typeof CycleMovementItemSchema>;

export const EntryTypeEnumSchema = z.enum([
    "DIRECT",
    "TRANSFER",
    "ACCRUAL",
    "CLAIM_OPENING",
    "SETTLEMENT",
    "CLAIM_PAYMENT",
    "CLAIM_RECEIPT",
    "ADJUSTMENT",
    "REVERSAL",
]);

export type EntryTypeEnum = z.infer<typeof EntryTypeEnumSchema>;

export const CycleEntryItemSchema = z.object({
    entryId: z.number().int().positive(),
    description: z.string(),
    type: EntryTypeEnumSchema,
    referenceDate: z.date(),
    dueDate: z.date(),
    competanceDate: z.date().nullable(),
    amount: z.number().int(), // valor relevante na perspectiva do balance do compromisso
    isReversed: z.boolean(),
    movements: z.array(CycleMovementItemSchema),
});

export type CycleEntryItem = z.infer<typeof CycleEntryItemSchema>;

export const GetCycleEntriesInputSchema = z.object({
    agreementId: z.number().int().positive().optional(),
    balanceId: z.number().int().positive().optional(),
    from: z.string().min(1, "Data inicial (from) é obrigatória"), // YYYY-MM-DD
    to: z.string().min(1, "Data final (to) é obrigatória"),       // YYYY-MM-DD
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    q: z.string().optional(),
}).refine((data) => data.agreementId !== undefined || data.balanceId !== undefined, {
    message: "É necessário informar agreementId ou balanceId.",
});

export type GetCycleEntriesInput = z.infer<typeof GetCycleEntriesInputSchema>;
