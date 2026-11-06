"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { SubcategoryPicker } from "./subcategory-picker"

const subcategoryStepSchema = z.object({
  base: z.object({
    subcategoryId: z.number().int().positive().nullable().optional(),
  }),
})

function buildSubcategoryWizardStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "base.subcategory",
    title: "Subcategoria",
    schema: subcategoryStepSchema,
    fields: [
      {
        name: "base.subcategoryId",
        children: (_ctx, field) => (
          <SubcategoryPicker
            value={field.value as number | null | undefined}
            onChange={(id) => field.onChange(id)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const subcategoryStepViews = {
  desktop: buildSubcategoryWizardStep("grid"),
  mobile: [buildSubcategoryWizardStep("carousel")],
} satisfies StepViews<OperationDraft>
