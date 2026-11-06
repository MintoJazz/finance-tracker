"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CyclePicker } from "./cycle-picker"

const custodyCycleStepSchema = z.object({
  base: z.object({
    competanceDate: z
      .string({ error: "Selecione a fatura do cartão" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione a fatura do cartão"),
  }),
})

function buildCustodyCycleWizardStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "base.custody-cycle",
    title: "Fatura do Cartão",
    description: "Em qual fatura este gasto será lançado?",
    schema: custodyCycleStepSchema,
    fields: [
      {
        name: "base.competanceDate",
        label: "Mês de referência",
        children: (_ctx, field) => (
          <CyclePicker
            value={(field.value as string | null | undefined) ?? null}
            onChange={(closingDate) => field.onChange(closingDate)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const custodyCycleStepViews = {
  desktop: buildCustodyCycleWizardStep("grid"),
  mobile: [buildCustodyCycleWizardStep("carousel")],
} satisfies StepViews<OperationDraft>
