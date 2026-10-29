import * as React from "react"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import type { WizardStep } from "@/components/wizard"
import type { SignupFormType } from "@/modules/auth/models/signup.schema"

export const accountStepSchema = z
  .object({
    email: z.string().email("Informe um e-mail válido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type AccountStepValues = z.infer<typeof accountStepSchema>

export const accountStep: WizardStep<SignupFormType> = {
  id: "account",
  title: "Acesso & Segurança",
  description: "Informe seu e-mail e crie uma senha segura",
  schema: accountStepSchema,
  fields: [
    {
      name: "email",
      label: "E-mail",
      children: (
        <Input
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
        />
      ),
    },
    {
      name: "password",
      label: "Senha",
      children: (
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      ),
    },
    {
      name: "confirmPassword",
      label: "Confirmar Senha",
      children: (
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      ),
    },
  ],
}
