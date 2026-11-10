"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { BaseOperationSliceSchema } from "@/modules/operations/models/operation-base.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CustodyPicker } from "./custody-picker"

const custodyStepSchema = z.object({
  base: z.object({
    custodyBalanceId: BaseOperationSliceSchema.shape.custodyBalanceId,
  }),
})

function buildCustodyWizardStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "base.custody",
    title: "Meio de Pagamento",
    description: "Escolha o meio de pagamento desta operação.",
    schema: custodyStepSchema,
    fields: [
      {
        name: "base.custodyBalanceId",
        children: (_ctx, field) => (
          <CustodyPicker
            value={field.value as number | undefined}
            onChange={(id) => field.onChange(id)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const custodyStepViews = {
  desktop: buildCustodyWizardStep("grid"),
  mobile: [buildCustodyWizardStep("carousel")],
} satisfies StepViews<OperationDraft>
