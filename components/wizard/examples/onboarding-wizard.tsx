"use client"

import * as React from "react"
import { z } from "zod"

import {
  DatePicker,
  HorizontalLayout,
  ListSelect,
  MoneyInput,
  RecordSelect,
} from "@/components/form"
import { Input } from "@/components/ui/input"
import {
  defineCustomStep,
  defineStep,
  ReviewStep,
  useWizardPersistence,
  Wizard,
  WizardActions,
  WizardProgress,
  WizardStepContent,
  WizardStepHeader,
  WizardStepper,
} from "@/components/wizard"
import { formatMoney } from "@/lib/formatters"
import { toast } from "@/components/ui/toast"

// 1. Schemas de cada etapa (Zod v4)
const personalStepSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  birthDate: z.date({ message: "Data de nascimento inválida" }),
  monthlyIncome: z.number({ message: "Informe a renda mensal" }).min(1, "Informe a renda mensal"),
})

const planStepSchema = z.object({
  planType: z.string().min(1, "Selecione um plano"),
  segmentId: z.number({ message: "Selecione um segmento" }).min(1, "Selecione um segmento"),
  wantsPaidPlan: z.boolean(),
  // Campo com hidden dentro do passo deve ser opcional para não travar o RHF quando oculto
  additionalNotes: z.string().optional(),
})

const paymentStepSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido (mínimo 16 dígitos)"),
  cardHolder: z.string().min(3, "Nome do titular obrigatório"),
  budgetLimit: z.number({ message: "Informe o limite" }).min(100, "Limite mínimo de R$ 1,00"),
})

export type OnboardingData = z.infer<typeof personalStepSchema> &
  z.infer<typeof planStepSchema> &
  Partial<z.infer<typeof paymentStepSchema>>

// 2. Definição declarativa dos passos
export const onboardingSteps = [
  defineStep<typeof personalStepSchema, OnboardingData>({
    id: "personal",
    title: "Dados Pessoais",
    description: "Informe seus dados básicos e data de nascimento",
    schema: personalStepSchema,
    fields: [
      {
        name: "fullName",
        label: "Nome Completo",
        description: "Seu nome como consta no documento",
        children: <Input placeholder="Ex: Maria Silva" />,
      },
      {
        name: "birthDate",
        label: "Data de Nascimento",
        layout: HorizontalLayout,
        children: <DatePicker />,
      },
      {
        name: "monthlyIncome",
        label: "Renda Mensal",
        display: (val) => formatMoney(Number(val ?? 0)),
        children: <MoneyInput />,
      },
    ],
  }),

  defineStep<typeof planStepSchema, OnboardingData>({
    id: "plan",
    title: "Plano & Preferências",
    description: "Escolha o plano e categoria de uso",
    schema: planStepSchema,
    fields: [
      {
        name: "planType",
        label: "Plano Desejado",
        children: (
          <RecordSelect
            placeholder="Escolha um plano"
            options={{
              free: { label: "Plano Gratuito (Básico)" },
              pro: { label: "Plano Pro (R$ 49/mês)" },
              enterprise: { label: "Plano Corporativo (Sob consulta)" },
            }}
          />
        ),
      },
      {
        name: "segmentId",
        label: "Segmento Principal",
        children: (
          <ListSelect
            placeholder="Selecione o segmento..."
            options={[
              { id: 1, name: "Finanças Pessoais" },
              { id: 2, name: "Pequena Empresa" },
              { id: 3, name: "Investimentos & Ações" },
            ]}
          />
        ),
      },
      {
        name: "wantsPaidPlan",
        label: "Desejo recursos premium avançados",
        children: <input type="checkbox" className="h-4 w-4 rounded border-input" />,
      },
      {
        name: "additionalNotes",
        label: "Observações Adicionais",
        // Campo oculto se não desejar plano premium
        hidden: (values) => !values.wantsPaidPlan,
        children: <Input placeholder="Alguma necessidade especial?" />,
      },
    ],
  }),

  // Passo condicional: só ativo se o usuário escolheu plano pago ou marcou recursos avançados
  defineStep<typeof paymentStepSchema, OnboardingData>({
    id: "payment",
    title: "Dados de Faturamento",
    description: "Insira os dados do cartão para cobrança do plano premium",
    when: (data) => Boolean(data.wantsPaidPlan || data.planType === "pro" || data.planType === "enterprise"),
    schema: paymentStepSchema,
    fields: [
      {
        name: "cardNumber",
        label: "Número do Cartão",
        children: <Input placeholder="0000 0000 0000 0000" maxLength={19} />,
      },
      {
        name: "cardHolder",
        label: "Nome Impresso no Cartão",
        children: <Input placeholder="MARIA SILVA" />,
      },
      {
        name: "budgetLimit",
        label: "Limite de Gastos Mensal",
        display: (val) => formatMoney(Number(val ?? 0)),
        children: <MoneyInput />,
      },
    ],
  }),

  defineCustomStep<OnboardingData>({
    id: "review",
    title: "Revisão e Confirmação",
    description: "Confira todos os seus dados antes de finalizar o cadastro",
    component: ReviewStep,
  }),
]

export function OnboardingWizard() {
  const persistence = useWizardPersistence<OnboardingData>("wizard_onboarding_demo")

  const handleComplete = async (finalData: OnboardingData) => {
    console.log("[OnboardingWizard] Concluído com sucesso:", finalData)
    toast.add({
      type: "success",
      title: "Cadastro Concluído!",
      description: `Bem-vindo(a), ${finalData.fullName}! Seus dados foram salvos.`,
      priority: "high",
    })
    persistence.clear()
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <Wizard<OnboardingData>
        steps={onboardingSteps}
        initialData={persistence.initialData}
        initialStepId={persistence.initialStepId}
        onChange={persistence.onChange}
        onComplete={handleComplete}
        pruneInactive={true}
      >
        <div className="space-y-6">
          <WizardProgress />
          <WizardStepper />
          <div className="pt-2">
            <WizardStepHeader />
            <WizardStepContent />
          </div>
          <div className="pt-4 border-t border-border">
            <WizardActions />
          </div>
        </div>
      </Wizard>
    </div>
  )
}
