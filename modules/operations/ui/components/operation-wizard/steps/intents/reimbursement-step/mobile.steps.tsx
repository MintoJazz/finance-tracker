"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { ReimbursementSliceSchema } from "@/modules/operations/models/intents/reimbursement.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { ReimbursementAmountField } from "./amount-field"
import { ReimbursementTargetsPicker } from "./targets-picker"

const reimbursementTargetsMobileSchema = z.object({
  DEMO_REIMBURSEMENT: z.object({
    targetIds: ReimbursementSliceSchema.shape.targetIds,
  }),
})

const reimbursementAmountMobileSchema = z.object({
  DEMO_REIMBURSEMENT: z.object({
    reimbursedAmount: ReimbursementSliceSchema.shape.reimbursedAmount,
  }),
})

export const reimbursementTargetsMobileStep: WizardStep<OperationDraft> = {
  id: "intent.reimbursement.targets.who",
  title: "Quem vai reembolsar?",
  description:
    "Selecione contatos ou grupos. Se marcar um grupo, a pill 'Ratear grupo' surgirá abaixo.",
  schema: reimbursementTargetsMobileSchema,
  fields: [
    {
      name: "DEMO_REIMBURSEMENT.targetIds",
      label: "Contatos e grupos",
      children: (_ctx, field) => (
        <ReimbursementTargetsPicker
          value={(field.value as string[] | undefined) ?? []}
          onChange={(ids) => field.onChange(ids)}
          variant="carousel"
          showIntentPills
        />
      ),
    },
  ],
}

export const reimbursementAmountMobileStep: WizardStep<OperationDraft> = {
  id: "intent.reimbursement.targets.amount",
  title: "Valor do Reembolso",
  description: "Qual parcela desta operação será ressarcida?",
  schema: reimbursementAmountMobileSchema,
  fields: [
    {
      name: "DEMO_REIMBURSEMENT.reimbursedAmount",
      label: "Valor a recuperar",
      children: (_ctx, field) => (
        <ReimbursementAmountField
          value={field.value as number | undefined}
          onChange={(val) => field.onChange(val)}
          showIntentPills
        />
      ),
    },
  ],
}

