"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { BaseOperationSliceSchema } from "@/modules/operations/models/operation-base.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { OperationAmountCard } from "./amount-card"

const amountStepSchema = z.object({
  base: z.object({
    amount: BaseOperationSliceSchema.shape.amount,
  }),
})

export const amountWizardStep: WizardStep<OperationDraft> = {
  id: "base.amount",
  title: "Valor da Operação",
  description: "Qual é o valor desta movimentação?",
  schema: amountStepSchema,
  fields: [
    {
      name: "base.amount",
      children: (_ctx, field) => (
        <OperationAmountCard
          value={field.value as number | undefined}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
}

export const amountStepViews = {
  desktop: amountWizardStep,
  mobile: [amountWizardStep],
} satisfies StepViews<OperationDraft>

