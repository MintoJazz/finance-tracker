import z from "zod";

export const CardProfileSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    limit: z.number().int().nonnegative(),
    usedLimit: z.number().int().nonnegative(),
    availableLimit: z.number().int().nonnegative(),
    closingDay: z.number().int().min(1).max(31),
    dueDay: z.number().int().min(1).max(31),
    isArchived: z.boolean(),
    createdAt: z.date(),
});

export type CardProfile = z.infer<typeof CardProfileSchema>;

export const GetCardProfileSchema = z.object({
    id: z.number().int().positive("ID do cartão inválido"),
});

export type GetCardProfileDTO = z.infer<typeof GetCardProfileSchema>;
