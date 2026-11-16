import { z } from "zod"
import type { IntentInitialSliceContext } from "../../application/intents/types"

export const ChooseCardInvoiceIntentSliceSchema = z.object({
  from: z
    .string({ error: "Selecione a fatura do cartão" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione uma fatura válida"),
  to: z
    .string({ error: "Selecione a fatura do cartão" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione uma fatura válida"),
  dueDate: z
    .string({ error: "Selecione a fatura do cartão" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de vencimento da fatura inválida"),
  label: z
    .string({ error: "Selecione a fatura do cartão" })
    .min(1, "Selecione uma fatura válida"),
})

export type ChooseCardInvoiceIntentSlice = z.infer<
  typeof ChooseCardInvoiceIntentSliceSchema
>

export function buildInitialCardInvoiceIntentSlice(
  _ctx?: IntentInitialSliceContext
): ChooseCardInvoiceIntentSlice {
  return {
    from: "",
    to: "",
    dueDate: "",
    label: "",
  }
}

