import z from "zod";

export const WalletSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.number().int(),
    lastActivityAt: z.date().nullable(),
    isArchived: z.boolean(),
});

export type WalletSummary = z.infer<typeof WalletSummarySchema>;

export const CreateWalletSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "O nome da carteira é obrigatório")
        .max(50, "O nome deve ter no máximo 50 caracteres"),
});

export type CreateWalletFormValues = z.infer<typeof CreateWalletSchema>;

export const UpdateWalletSchema = z.object({
    id: z.number().int().positive("ID da carteira inválido"),
    name: z
        .string()
        .trim()
        .min(1, "O nome da carteira é obrigatório")
        .max(50, "O nome deve ter no máximo 50 caracteres"),
});

export type UpdateWalletInput = z.infer<typeof UpdateWalletSchema>;