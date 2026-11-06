"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { InstallmentsSliceSchema } from "@/modules/operations/models/intents/installments.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { InstallmentsCountPicker } from "./count-picker"
import { InstallmentsIntervalPicker } from "./interval-picker"

const installmentsDesktopSchema = z.object({
  DEMO_INSTALLMENTS: InstallmentsSliceSchema,
})

export const installmentsDesktopStep: WizardStep<OperationDraft> = {
  id: "intent.installments.config",
  title: "Configuração de Parcelas",
  description: "Defina em quantas vezes e o intervalo entre os vencimentos.",
  schema: installmentsDesktopSchema,
  fields: [
    {
      name: "DEMO_INSTALLMENTS.count",
      label: "Quantidade de parcelas",
      children: (_ctx, field) => (
        <InstallmentsCountPicker
          value={(field.value as number | undefined) ?? 2}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
    {
      name: "DEMO_INSTALLMENTS.intervalDays",
      label: "Periodicidade entre parcelas",
      children: (_ctx, field) => (
        <InstallmentsIntervalPicker
          value={(field.value as number | undefined) ?? 30}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
}

