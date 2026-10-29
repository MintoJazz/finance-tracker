import { z } from "zod";

export const AuthSchema = z.object({
    partyId: z.number().int().positive(),
    email: z.string().trim().toLowerCase().email(),
    password: z.string(),
    emailVerifiedAt: z.date().nullable(),
    lastLoginAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Auth = z.infer<typeof AuthSchema>;