import * as React from "react"
import { z } from "zod"

import { DatePicker } from "@/components/form"
import { Input } from "@/components/ui/input"
import type { WizardStep } from "@/components/wizard"
import type { SignupFormType } from "@/modules/identity/core/schemas/signup.schema"

export const profileStepSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo"),
  documentNumber: z.string().min(11, "Informe o CPF/Documento (mínimo 11 dígitos)"),
  birthDate: z.coerce.date().nullable().optional(),
  phone: z.string().trim().optional(),
})

export type ProfileStepValues = z.infer<typeof profileStepSchema>

export const profileStep: WizardStep<SignupFormType> = {
  id: "profile",
  title: "Dados Pessoais",
  description: "Identificação e informações de contato",
  schema: profileStepSchema,
  fields: [
    {
      name: "name",
      label: "Nome Completo",
      children: (
        <Input
          placeholder="João da Silva"
          autoComplete="name"
        />
      ),
    },
    {
      name: "documentNumber",
      label: "CPF / Documento",
      children: (
        <Input
          placeholder="000.000.000-00"
        />
      ),
    },
    {
      name: "birthDate",
      label: "Data de Nascimento",
      children: <DatePicker />,
    },
    {
      name: "phone",
      label: "Telefone / WhatsApp",
      description: "Opcional",
      children: (
        <Input
          type="tel"
          placeholder="(00) 00000-0000"
          autoComplete="tel"
        />
      ),
    },
  ],
}
