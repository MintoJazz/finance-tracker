import z from "zod";

export const CardEntitySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    contextId: z.number().int().positive(),
    isArchived: z.boolean(),
});

export type CardEntity = z.infer<typeof CardEntitySchema>;

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

export const CardFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "O nome do cartão é obrigatório")
        .max(50, "O nome deve ter no máximo 50 caracteres"),
    limit: z
        .number({ message: "Informe um limite válido" })
        .int("O limite deve ser um número inteiro (em centavos)")
        .nonnegative("O limite não pode ser negativo"),
    closingDay: z
        .number({ message: "Informe o dia de fechamento" })
        .int("Informe um dia válido")
        .min(1, "O dia deve ser entre 1 e 31")
        .max(31, "O dia deve ser entre 1 e 31"),
    dueDay: z
        .number({ message: "Informe o dia de vencimento" })
        .int("Informe um dia válido")
        .min(1, "O dia deve ser entre 1 e 31")
        .max(31, "O dia deve ser entre 1 e 31"),
});

export type CardFormValues = z.infer<typeof CardFormSchema>;

export const CreateCardSchema = CardFormSchema;
export type CreateCardFormValues = z.infer<typeof CreateCardSchema>;

export const ArchiveCardSchema = z.object({
    id: z.number().int().positive("ID do cartão inválido"),
});
export type ArchiveCardInput = z.infer<typeof ArchiveCardSchema>;

export const RestoreCardSchema = z.object({
    id: z.number().int().positive("ID do cartão inválido"),
});
export type RestoreCardInput = z.infer<typeof RestoreCardSchema>;