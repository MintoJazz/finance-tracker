import z from "zod";

export const BalanceTypeEnumSchema = z.enum([
    "WALLET",
    "CREDIT",
    "RESERVE",
    "CATEGORY",
    "COMMITMENT"
]);

export type BalanceTypeEnum = z.infer<typeof BalanceTypeEnumSchema>;

export const BalanceSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Nome deve ter pelo menos 1 caractere"),
    type: BalanceTypeEnumSchema,
    financialContextId: z.number().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    removedAt: z.date().nullable().optional()
});

export const BalanceInputSchema = BalanceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    removedAt: true
});

export type Balance = z.infer<typeof BalanceSchema>;
export type BalanceInput = z.infer<typeof BalanceInputSchema>;