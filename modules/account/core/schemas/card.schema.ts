import z from "zod";

export const CardSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    limit: z.number().int(),              // Limite total (em centavos)
    usedLimit: z.number().int(),          // Fatura atual / Limite utilizado (em centavos)
    availableLimit: z.number().int(),     // Limite disponível (em centavos)
    closingDay: z.number().min(1).max(31),// Dia de fechamento da fatura
    dueDay: z.number().min(1).max(31),    // Dia de vencimento da fatura
    lastActivityAt: z.date().nullable(),
    isArchived: z.boolean(),
});

export type CardSummary = z.infer<typeof CardSummarySchema>;
