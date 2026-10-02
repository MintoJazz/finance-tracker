import { z } from "zod";

export const SignupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Informe um e-mail válido"),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirme sua senha"),

    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres"),
    documentNumber: z
      .string()
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 11, {
        message: "CPF deve conter 11 dígitos",
      }),
    phone: z.string().trim().optional(),
    birthDate: z.coerce.date().nullable().optional(),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignupFormType = z.infer<typeof SignupSchema>;