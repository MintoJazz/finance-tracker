import * as React from "react"
import z from "zod"
import { Input } from "@/components/ui/input"
import type { WizardStep } from "@/components/wizard"
import {
  CardFormSchema,
  type CardFormValues,
} from "@/modules/account/core/schemas/card.schema"

export const cardCycleStepSchema = z.object({
  closingDay: CardFormSchema.shape.closingDay,
  dueDay: CardFormSchema.shape.dueDay,
})

export const cardCycleStep: WizardStep<CardFormValues> = {
  id: "cycle",
  title: "Ciclo da Fatura",
  schema: cardCycleStepSchema,
  fields: [
    {
      name: "closingDay",
      label: "Dia de fechamento",
      description: "Dia do mês em que a fatura fecha (1 a 31).",
      children: (_ctx, field) => (
        <Input
          type="number"
          min={1}
          max={31}
          step={1}
          placeholder="Ex: 1"
          value={
            typeof field.value === "number" && field.value > 0
              ? field.value
              : ""
          }
          onChange={(e) => {
            const val = e.target.value
            field.onChange(val === "" ? "" : Number(val))
          }}
          className="font-mono tabular-nums"
        />
      ),
    },
    {
      name: "dueDay",
      label: "Dia de vencimento",
      description: "Dia do mês em que a fatura vence (1 a 31).",
      children: (_ctx, field) => (
        <Input
          type="number"
          min={1}
          max={31}
          step={1}
          placeholder="Ex: 10"
          value={
            typeof field.value === "number" && field.value > 0
              ? field.value
              : ""
          }
          onChange={(e) => {
            const val = e.target.value
            field.onChange(val === "" ? "" : Number(val))
          }}
          className="font-mono tabular-nums"
        />
      ),
    },
  ],
}
