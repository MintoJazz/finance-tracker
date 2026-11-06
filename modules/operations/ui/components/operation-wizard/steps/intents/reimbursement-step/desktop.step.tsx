"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { ReimbursementSliceSchema } from "@/modules/operations/models/intents/reimbursement.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { ReimbursementAmountField } from "./amount-field"
import { ReimbursementTargetsPicker } from "./targets-picker"

const reimbursementDesktopSchema = z.object({
  DEMO_REIMBURSEMENT: ReimbursementSliceSchema,
})

export const reimbursementDesktopStep: WizardStep<OperationDraft> = {
  id: "intent.reimbursement.targets",
  title: "Reembolso de Terceiros",
  description:
    "Escolha os contatos ou grupos que vão reembolsar esta despesa. Se marcar um grupo, a opção de rateio aparecerá abaixo.",
  schema: reimbursementDesktopSchema,
  fields: [
    {
      name: "DEMO_REIMBURSEMENT.targetIds",
      label: "Contatos e grupos (múltipla escolha)",
      children: (_ctx, field) => (
        <ReimbursementTargetsPicker
          value={(field.value as string[] | undefined) ?? []}
          onChange={(ids) => field.onChange(ids)}
          variant="grid"
          showIntentPills={false}
        />
      ),
    },
    {
      name: "DEMO_REIMBURSEMENT.reimbursedAmount",
      label: "Valor total a recuperar",
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

