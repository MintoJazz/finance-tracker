"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { BaseOperationSliceSchema } from "@/modules/operations/models/operation-base.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { OperationAmountField } from "./amount-field"
import { OperationDateInput } from "./dates-fields"
import { OperationDescriptionInput } from "./description-field"

const detailsDesktopSchema = z.object({
  base: z.object({
    amount: BaseOperationSliceSchema.shape.amount,
    dueDate: BaseOperationSliceSchema.shape.dueDate,
    description: BaseOperationSliceSchema.shape.description,
  }),
})

export const detailsDesktopStep: WizardStep<OperationDraft> = {
  id: "base.details",
  title: "Valor, Data e Descrição",
  description: "Preencha os dados financeiros principais da operação.",
  schema: detailsDesktopSchema,
  fields: [
    {
      row: [
        {
          name: "base.amount",
          label: "Valor da operação",
          children: (_ctx, field) => (
            <OperationAmountField
              value={field.value as number | undefined}
              onChange={(val) => field.onChange(val)}
              showIntentPills={false}
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
    },
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
  ],
}
