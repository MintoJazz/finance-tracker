"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import {
  ChooseCardInvoiceIntentSliceSchema,
  type ChooseCardInvoiceIntentSlice,
} from "@/modules/operations/models/intents/choose-card-invoice.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CardInvoicePicker } from "./card-invoice-picker"

const cardInvoiceWizardSchema = z
  .object({
    CHOOSE_CARD_INVOICE: ChooseCardInvoiceIntentSliceSchema.optional(),
  })
  .superRefine((val, ctx) => {
    const slice = val.CHOOSE_CARD_INVOICE
    if (!slice?.from || !slice?.to || !slice?.dueDate || !slice?.label) {
      ctx.addIssue({
        code: "custom",
        path: ["CHOOSE_CARD_INVOICE"],
        message: "Selecione uma fatura do cartão para continuar.",
      })
    }
  })

function buildCardInvoiceStep(
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  return {
    id: "intent.choose_card_invoice",
    title: "Fatura do Cartão",
    description:
      "Escolha a fatura do cartão na qual esta compra será lançada.",
    schema: cardInvoiceWizardSchema,
    fields: [
      {
        name: "CHOOSE_CARD_INVOICE",
        children: (_ctx, field) => (
          <CardInvoicePicker
            value={
              field.value as
                | Partial<ChooseCardInvoiceIntentSlice>
                | undefined
            }
            onChange={(val) => field.onChange(val)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

export const cardInvoiceStepViews = {
  desktop: buildCardInvoiceStep("grid"),
  mobile: [buildCardInvoiceStep("carousel")],
} satisfies StepViews<OperationDraft>

