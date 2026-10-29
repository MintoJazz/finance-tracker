import z from "zod";

export const WalletProfileSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    currentBalance: z.number().int(), // Inteiro em centavos (pode ser negativo, zero ou positivo)
    isArchived: z.boolean(),
    createdAt: z.date(),
});

export type WalletProfile = z.infer<typeof WalletProfileSchema>;

export const GetWalletProfileSchema = z.object({
    id: z.number().int().positive("ID da carteira inválido"),
});

export type GetWalletProfileDTO = z.infer<typeof GetWalletProfileSchema>;