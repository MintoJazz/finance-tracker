"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { BaseOperationSliceSchema } from "@/modules/operations/models/operation-base.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { OperationDateInput } from "./dates-fields"
import { OperationDescriptionInput } from "./description-field"

const detailsDesktopSchema = z.object({
  base: z.object({
    description: BaseOperationSliceSchema.shape.description,
    dueDate: BaseOperationSliceSchema.shape.dueDate,
  }),
})

export const detailsDesktopStep: WizardStep<OperationDraft> = {
  id: "base.details",
  title: "Descrição e Data",
  description: "Identifique a operação e informe quando ela ocorre.",
  schema: detailsDesktopSchema,
  fields: [
    {
      name: "base.description",
      label: "Descrição do lançamento",
      children: (_ctx, field) => (
        <OperationDescriptionInput
          value={field.value as string | undefined}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
    {
      name: "base.dueDate",
      label: "Data da operação",
      children: (_ctx, field) => (
        <OperationDateInput
          fieldKey="dueDate"
          value={field.value as string | undefined}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
}
