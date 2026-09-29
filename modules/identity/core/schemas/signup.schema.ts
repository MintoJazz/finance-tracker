import { z } from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    confirmPassword: z.string(),

    name: z.string(),
    documentNumber: z.string(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
    birthDate: z.coerce.date().nullable(),
}).refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export const CreateUserSchema = z.object({
    email: z.string().email(),
    passwordHash: z.string(),
    name: z.string(),
    documentNumber: z.string(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
    birthDate: z.coerce.date().nullable(),
})

export type SignupFormType = z.infer<typeof SignupSchema>;
export type CreateUserType = z.infer<typeof CreateUserSchema>;