"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import {
  OperationNatureSchema,
  type OperationNature,
} from "@/modules/operations/models/operation-seed.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { NaturePicker } from "./nature-picker"

const entryStepSchema = z.object({
  nature: OperationNatureSchema,
})

function buildEntryWizardStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "base.entry",
    title: "Tipo de Operação",
    description: "Qual é o sentido desta movimentação financeira?",
    schema: entryStepSchema,
    fields: [
      {
        name: "nature",
        children: (_ctx, field) => (
          <NaturePicker
            value={(field.value as OperationNature | undefined) ?? "PAY"}
            onChange={(val) => field.onChange(val)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const entryStepViews = {
  desktop: buildEntryWizardStep("grid"),
  mobile: [buildEntryWizardStep("carousel")],
} satisfies StepViews<OperationDraft>
