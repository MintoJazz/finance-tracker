"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { InstallmentsSliceSchema } from "@/modules/operations/models/intents/installments.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { InstallmentsCountPicker } from "./count-picker"
import { InstallmentsIntervalPicker } from "./interval-picker"

const installmentsCountMobileSchema = z.object({
  DEMO_INSTALLMENTS: z.object({
    count: InstallmentsSliceSchema.shape.count,
  }),
})

const installmentsIntervalMobileSchema = z.object({
  DEMO_INSTALLMENTS: z.object({
    intervalDays: InstallmentsSliceSchema.shape.intervalDays,
  }),
})

export const installmentsCountMobileStep: WizardStep<OperationDraft> = {
  id: "intent.installments.count",
  title: "Número de Parcelas",
  description: "Deslize e escolha em quantas vezes dividir.",
  schema: installmentsCountMobileSchema,
  fields: [
    {
      name: "DEMO_INSTALLMENTS.count",
      label: "Parcelas",
      children: (_ctx, field) => (
        <InstallmentsCountPicker
          value={(field.value as number | undefined) ?? 2}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
}

export const installmentsIntervalMobileStep: WizardStep<OperationDraft> = {
  id: "intent.installments.interval",
  title: "Intervalo das Parcelas",
  description: "Qual é a periodicidade entre cada vencimento?",
  schema: installmentsIntervalMobileSchema,
  fields: [
    {
      name: "DEMO_INSTALLMENTS.intervalDays",
      label: "Periodicidade",
      children: (_ctx, field) => (
        <InstallmentsIntervalPicker
          value={(field.value as number | undefined) ?? 30}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
}

