"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { SettleCommitmentSliceSchema } from "@/modules/operations/models/intents/settle-commitment.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CommitmentPicker } from "./commitment-picker"

const settleCommitmentStepSchema = z.object({
  DEMO_SETTLE: SettleCommitmentSliceSchema,
})

function buildSettleCommitmentWizardStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "intent.settle.select",
    title: "Compromisso em Aberto",
    description:
      "Selecione qual obrigação existente está sendo liquidada (a categoria já vem do compromisso).",
    schema: settleCommitmentStepSchema,
    fields: [
      {
        name: "DEMO_SETTLE.commitmentId",
        label: "Compromisso",
        children: (_ctx, field) => (
          <CommitmentPicker
            value={field.value as number | undefined}
            onChange={(id) => field.onChange(id)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const settleCommitmentStepViews = {
  desktop: buildSettleCommitmentWizardStep("grid"),
  mobile: [buildSettleCommitmentWizardStep("carousel")],
} satisfies StepViews<OperationDraft>
