import z from "zod";

export const WalletSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.number().int(),
    lastActivityAt: z.date().nullable(),
    isArchived: z.boolean(),
});

export type WalletSummary = z.infer<typeof WalletSummarySchema>;