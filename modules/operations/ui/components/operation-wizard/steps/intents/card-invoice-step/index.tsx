"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { ChooseCardInvoiceIntentSliceSchema } from "@/modules/operations/models/intents/choose-card-invoice.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CardInvoicePicker } from "./card-invoice-picker"

const cardInvoiceWizardSchema = z.object({
  CHOOSE_CARD_INVOICE: ChooseCardInvoiceIntentSliceSchema,
})

function buildCardInvoiceStep(): WizardStep<OperationDraft> {
  return {
    id: "intent.choose_card_invoice",
    title: "Fatura do Cartão",
    description: "Escolha o mês e o ano da fatura na qual esta compra será lançada.",
    schema: cardInvoiceWizardSchema,
    fields: [
      {
        name: "CHOOSE_CARD_INVOICE",
        children: (_ctx, field) => (
          <CardInvoicePicker
            value={field.value as { month?: number; year?: number } | undefined}
            onChange={(val) => field.onChange(val)}
          />
        ),
      },
    ],
  }
}

export const cardInvoiceStepViews: StepViews<OperationDraft> = {
  desktop: buildCardInvoiceStep(),
  mobile: [buildCardInvoiceStep()],
}

