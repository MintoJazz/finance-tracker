"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CategoryPicker } from "./category-picker"

const categoryStepSchema = z.object({
  base: z.object({
    categoryId: z
      .number({ error: "Selecione uma categoria" })
      .int()
      .positive("Selecione uma categoria"),
  }),
})

function buildCategoryWizardStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "base.category",
    title: "Categoria",
    description:
      "Classifique a operação ou clique em '+ Nova categoria' nas opções.",
    schema: categoryStepSchema,
    fields: [
      {
        name: "base.categoryId",
        children: (_ctx, field) => (
          <CategoryPicker
            value={field.value as number | undefined}
            onChange={(id) => field.onChange(id)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const categoryStepViews = {
  desktop: buildCategoryWizardStep("grid"),
  mobile: [buildCategoryWizardStep("carousel")],
} satisfies StepViews<OperationDraft>
