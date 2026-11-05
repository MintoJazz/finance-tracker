"use client"

import * as React from "react"
import { CalendarClock, HandCoins, Layers } from "lucide-react"
import { z } from "zod"
import { MoneyInput } from "@/components/form"
import { Input } from "@/components/ui/input"
import type { WizardStep } from "@/components/wizard"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { BASE_STEPS } from "../../application/steps/base.steps"
import { STEP_ORDER } from "../../application/steps/order"
import type { OperationStepCatalog } from "../../application/steps/interpreter"
import type { StepDefinition } from "../../application/steps/types"
import type { OperationDraft } from "../../models/operation-input.schema"
import type {
  OperationLookupData,
  StepViews,
  StepViewsCatalog,
} from "../steps/types"
import { BASE_STEP_VIEWS } from "../steps/views"

export const PLAYGROUND_LOOKUPS: OperationLookupData = {
  wallets: [
    {
      id: 1,
      name: "Conta Corrente Principal",
      institution: "Itaú Unibanco",
      balanceCents: 485200,
    },
    {
      id: 2,
      name: "Reserva de Liquidez",
      institution: "Nubank",
      balanceCents: 1250000,
    },
    {
      id: 3,
      name: "Caixa em Espécie",
      balanceCents: 32000,
    },
  ],
  categories: [
    {
      id: 101,
      name: "Supermercado",
      parentName: "Alimentação",
      color: "#10b981",
    },
    {
      id: 102,
      name: "Restaurantes & Delivery",
      parentName: "Alimentação",
      color: "#f59e0b",
    },
    {
      id: 103,
      name: "Moradia & Condomínio",
      parentName: "Casa",
      color: "#6366f1",
    },
    {
      id: 104,
      name: "Consultoria & Projetos",
      parentName: "Receitas Operacionais",
      color: "#0ea5e9",
    },
    {
      id: 105,
      name: "Assinaturas & Software",
      parentName: "Tecnologia",
      color: "#8b5cf6",
    },
    {
      id: 106,
      name: "Transporte & Combustível",
      parentName: "Mobilidade",
      color: "#ec4899",
    },
  ],
}

export const DEMO_COMMITMENTS = [
  {
    id: 501,
    title: "Aluguel Residencial — Nov/2026",
    counterparty: "Imobiliária Central",
    suggestedAmountCents: 280000,
  },
  {
    id: 502,
    title: "Energia Elétrica — Out/2026",
    counterparty: "Enel Distribuição",
    suggestedAmountCents: 34590,
  },
  {
    id: 503,
    title: "Internet Fibra 1 Gbps",
    counterparty: "Vivo Fibra",
    suggestedAmountCents: 14990,
  },
] as const

export type DemoIntentKey =
  | "DEMO_SETTLE"
  | "DEMO_INSTALLMENTS"
  | "DEMO_REIMBURSEMENT"

// ============================================================================
// Schemas das intenções falsas do Playground
// ============================================================================

export const DemoSettleSliceSchema = z.object({
  commitmentId: z
    .number({ error: "Selecione um compromisso em aberto" })
    .int()
    .positive("Selecione um compromisso em aberto"),
})

export const DemoInstallmentsSliceSchema = z.object({
  count: z
    .number({ error: "Informe o número de parcelas" })
    .int()
    .min(2, "Mínimo de 2 parcelas")
    .max(48, "Máximo de 48 parcelas"),
  intervalDays: z
    .number({ error: "Informe o intervalo em dias" })
    .int()
    .min(1, "Intervalo mínimo de 1 dia")
    .max(365, "Intervalo máximo de 365 dias"),
})

export const DemoReimbursementSliceSchema = z.object({
  personName: z
    .string({ error: "Informe quem vai reembolsar" })
    .trim()
    .min(2, "Informe quem vai reembolsar"),
  reimbursedAmount: z
    .number({ error: "Informe o valor a reembolsar" })
    .int()
    .positive("O valor a reembolsar deve ser maior que zero"),
})

// ============================================================================
// Metadados puros das etapas das intenções falsas
// ============================================================================

export const demoSettleSelectStep = {
  id: "intent.demo_settle.select",
  order: 1500, // Na faixa ENTRY (antes de base.transaction = 2000)
  source: "DEMO_SETTLE",
  fields: ["DEMO_SETTLE.commitmentId"],
} as const satisfies StepDefinition<DemoIntentKey>

export const demoInstallmentsConfigStep = {
  id: "intent.demo_installments.config",
  order: STEP_ORDER.INTENT_PRIMARY, // 4000
  source: "DEMO_INSTALLMENTS",
  fields: ["DEMO_INSTALLMENTS.count", "DEMO_INSTALLMENTS.intervalDays"],
} as const satisfies StepDefinition<DemoIntentKey>

export const demoReimbursementWhoStep = {
  id: "intent.demo_reimbursement.who",
  order: STEP_ORDER.INTENT_SECONDARY, // 5000
  source: "DEMO_REIMBURSEMENT",
  fields: ["DEMO_REIMBURSEMENT.personName"],
} as const satisfies StepDefinition<DemoIntentKey>

export const demoReimbursementAmountStep = {
  id: "intent.demo_reimbursement.amount",
  order: 5100,
  source: "DEMO_REIMBURSEMENT",
  fields: ["DEMO_REIMBURSEMENT.reimbursedAmount"],
} as const satisfies StepDefinition<DemoIntentKey>

export const PLAYGROUND_CATALOG: OperationStepCatalog<
  DemoIntentKey,
  StepDefinition<DemoIntentKey>
> = {
  base: BASE_STEPS,
  intents: {
    DEMO_SETTLE: {
      key: "DEMO_SETTLE",
      schema: DemoSettleSliceSchema,
      addSteps: [demoSettleSelectStep],
      removeSteps: ["base.category"],
      excludes: ["DEMO_INSTALLMENTS"],
      requires: [],
      offer: {
        at: "base.entry",
        label: "Quitar compromisso existente (Demo)",
        description:
          "Adiciona etapa de escolha de compromisso (order 1500), remove a etapa de Categoria e exclui Parcelamento.",
      },
    },
    DEMO_INSTALLMENTS: {
      key: "DEMO_INSTALLMENTS",
      schema: DemoInstallmentsSliceSchema,
      addSteps: [demoInstallmentsConfigStep],
      removeSteps: [],
      excludes: ["DEMO_SETTLE"],
      requires: [],
      offer: {
        at: "base.transaction",
        nearField: "base.amount",
        label: "Parcelar operação (Demo)",
        description:
          "Ancorado perto do campo Valor no mobile. Adiciona etapa de configuração de parcelas (order 4000).",
      },
    },
    DEMO_REIMBURSEMENT: {
      key: "DEMO_REIMBURSEMENT",
      schema: DemoReimbursementSliceSchema,
      addSteps: [demoReimbursementWhoStep, demoReimbursementAmountStep],
      removeSteps: [],
      excludes: [],
      requires: [],
      offer: {
        at: "base.category",
        label: "Pedir reembolso a terceiro (Demo)",
        description:
          "Demonstra uma intenção que injeta múltiplas etapas lógicas em sequência (orders 5000 e 5100).",
      },
    },
  },
}

// ============================================================================
// Apresentações (Desktop & Mobile) para as etapas das intenções falsas
// ============================================================================

function CommitmentPickerControl({
  value,
  onChange,
}: {
  value?: number
  onChange: (id: number) => void
}) {
  return (
    <div className="space-y-2">
      {DEMO_COMMITMENTS.map((item) => {
        const isSelected = value === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-pressed={isSelected}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/10 ring-1 ring-primary/25"
                : "border-border bg-card/60 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarClock className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-foreground truncate">
                  {item.title}
                </span>
                <span className="block text-[11px] text-muted-foreground truncate">
                  {item.counterparty}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold tabular-nums text-foreground shrink-0">
              {formatMoney(item.suggestedAmountCents)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const demoSettleScreen = {
  id: "intent.demo_settle.select",
  title: "Compromisso em Aberto",
  description:
    "Escolha qual obrigação existente está sendo liquidada (a categoria vem do próprio compromisso).",
  schema: z.object({
    DEMO_SETTLE: DemoSettleSliceSchema,
  }),
  fields: [
    {
      name: "DEMO_SETTLE.commitmentId",
      label: "Compromisso",
      children: (_ctx, field) => (
        <CommitmentPickerControl
          value={field.value as number | undefined}
          onChange={(id) => field.onChange(id)}
        />
      ),
    },
  ],
} satisfies WizardStep<OperationDraft>

const demoInstallmentsDesktopScreen = {
  id: "intent.demo_installments.config",
  title: "Configuração de Parcelas",
  description: "Defina em quantas vezes e o intervalo entre os vencimentos.",
  schema: z.object({
    DEMO_INSTALLMENTS: DemoInstallmentsSliceSchema,
  }),
  fields: [
    {
      row: [
        {
          name: "DEMO_INSTALLMENTS.count",
          label: "Quantidade de parcelas",
          children: (_ctx, field) => (
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 3, 6, 10, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => field.onChange(n)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-all cursor-pointer",
                    field.value === n
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/25"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  {n}x
                </button>
              ))}
            </div>
          ),
        },
        {
          name: "DEMO_INSTALLMENTS.intervalDays",
          label: "Intervalo entre parcelas (dias)",
          children: (_ctx, field) => (
            <div className="grid grid-cols-3 gap-1.5">
              {[15, 30, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => field.onChange(days)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-all cursor-pointer",
                    field.value === days
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/25"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  {days} dias
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
  ],
} satisfies WizardStep<OperationDraft>

const demoInstallmentsMobileCountScreen = {
  id: "intent.demo_installments.count",
  title: "Número de Parcelas",
  description: "Em quantas vezes esta operação será dividida?",
  schema: z.object({
    DEMO_INSTALLMENTS: z.object({
      count: DemoInstallmentsSliceSchema.shape.count,
    }),
  }),
  fields: [
    {
      name: "DEMO_INSTALLMENTS.count",
      label: "Parcelas",
      children: (_ctx, field) => (
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 4, 6, 10, 12].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => field.onChange(n)}
              className={cn(
                "flex items-center justify-center gap-1.5 h-10 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                field.value === n
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/25"
                  : "border-border hover:bg-muted text-muted-foreground"
              )}
            >
              <Layers className="size-3.5" />
              {n}x
            </button>
          ))}
        </div>
      ),
    },
  ],
} satisfies WizardStep<OperationDraft>

const demoInstallmentsMobileIntervalScreen = {
  id: "intent.demo_installments.interval",
  title: "Intervalo das Parcelas",
  description: "Qual é a periodicidade entre cada parcela?",
  schema: z.object({
    DEMO_INSTALLMENTS: z.object({
      intervalDays: DemoInstallmentsSliceSchema.shape.intervalDays,
    }),
  }),
  fields: [
    {
      name: "DEMO_INSTALLMENTS.intervalDays",
      label: "Intervalo em dias",
      children: (_ctx, field) => (
        <div className="grid grid-cols-3 gap-2">
          {[15, 30, 60].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => field.onChange(days)}
              className={cn(
                "h-10 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                field.value === days
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/25"
                  : "border-border hover:bg-muted text-muted-foreground"
              )}
            >
              A cada {days}d
            </button>
          ))}
        </div>
      ),
    },
  ],
} satisfies WizardStep<OperationDraft>

const demoReimbursementWhoScreen = {
  id: "intent.demo_reimbursement.who",
  title: "Quem vai reembolsar?",
  description: "Identifique a pessoa ou empresa responsável pelo reembolso.",
  schema: z.object({
    DEMO_REIMBURSEMENT: z.object({
      personName: DemoReimbursementSliceSchema.shape.personName,
    }),
  }),
  fields: [
    {
      name: "DEMO_REIMBURSEMENT.personName",
      label: "Parte responsável pelo reembolso",
      children: (
        <Input
          placeholder="Ex: Empresa XPTO, João Silva..."
          autoComplete="off"
          className="h-9 text-sm"
        />
      ),
    },
  ],
} satisfies WizardStep<OperationDraft>

const demoReimbursementAmountScreen = {
  id: "intent.demo_reimbursement.amount",
  title: "Valor do Reembolso",
  description: "Informe a parcela do gasto que será reembolsada.",
  schema: z.object({
    DEMO_REIMBURSEMENT: z.object({
      reimbursedAmount: DemoReimbursementSliceSchema.shape.reimbursedAmount,
    }),
  }),
  fields: [
    {
      name: "DEMO_REIMBURSEMENT.reimbursedAmount",
      label: "Valor a recuperar",
      description: "Pode ser o valor integral ou parcial da despesa.",
      children: (
        <div className="relative">
          <HandCoins className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
          <MoneyInput
            placeholder="R$ 0,00"
            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1.5 text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
          />
        </div>
      ),
    },
  ],
} satisfies WizardStep<OperationDraft>

export const PLAYGROUND_STEP_VIEWS = {
  ...BASE_STEP_VIEWS,
  "intent.demo_settle.select": {
    desktop: demoSettleScreen,
    mobile: [demoSettleScreen],
  } satisfies StepViews<OperationDraft>,
  "intent.demo_installments.config": {
    desktop: demoInstallmentsDesktopScreen,
    mobile: [
      demoInstallmentsMobileCountScreen,
      demoInstallmentsMobileIntervalScreen,
    ],
  } satisfies StepViews<OperationDraft>,
  "intent.demo_reimbursement.who": {
    desktop: demoReimbursementWhoScreen,
    mobile: [demoReimbursementWhoScreen],
  } satisfies StepViews<OperationDraft>,
  "intent.demo_reimbursement.amount": {
    desktop: demoReimbursementAmountScreen,
    mobile: [demoReimbursementAmountScreen],
  } satisfies StepViews<OperationDraft>,
} satisfies StepViewsCatalog<string, OperationDraft>
