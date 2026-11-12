"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { BaseOperationSliceSchema } from "@/modules/operations/models/operation-base.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { OperationDateInput } from "./dates-fields"
import { OperationDescriptionInput } from "./description-field"

const mobileDescriptionSchema = z.object({
  base: z.object({
    description: BaseOperationSliceSchema.shape.description,
  }),
})

const mobileDateSchema = z.object({
  base: z.object({
    dueDate: BaseOperationSliceSchema.shape.dueDate,
  }),
})

export const detailsDescriptionMobileStep: WizardStep<OperationDraft> = {
  id: "base.details.description",
  title: "Descrição",
  description: "Identifique brevemente esta operação.",
  schema: mobileDescriptionSchema,
  fields: [
    {
      name: "base.description",
      label: "Descrição",
      children: (_ctx, field) => (
        <OperationDescriptionInput
          value={field.value as string | undefined}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
}

export const detailsDatesMobileStep: WizardStep<OperationDraft> = {
  id: "base.details.dates",
  title: "Data da Operação",
  description: "Quando ocorre esta movimentação?",
  schema: mobileDateSchema,
  fields: [
    {
      name: "base.dueDate",
      label: "Data",
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
