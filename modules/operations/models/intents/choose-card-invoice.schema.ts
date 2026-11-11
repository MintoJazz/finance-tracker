import { z } from "zod"
import type { IntentInitialSliceContext } from "../../application/intents/types"

export const ChooseCardInvoiceIntentSliceSchema = z.object({
  month: z
    .number({ error: "Mês da fatura é obrigatório" })
    .int()
    .min(1, "Mês deve ser entre 1 e 12")
    .max(12, "Mês deve ser entre 1 e 12"),
  year: z
    .number({ error: "Ano da fatura é obrigatório" })
    .int()
    .min(2000, "Ano inválido")
    .max(2100, "Ano inválido"),
})

export type ChooseCardInvoiceIntentSlice = z.infer<
  typeof ChooseCardInvoiceIntentSliceSchema
>

export function buildInitialCardInvoiceIntentSlice(
  ctx?: IntentInitialSliceContext
): ChooseCardInvoiceIntentSlice {
  const baseDate = ctx?.seed?.dueDate ? new Date(ctx.seed.dueDate) : new Date()
  const validDate = isNaN(baseDate.getTime()) ? new Date() : baseDate

  return {
    month: validDate.getMonth() + 1,
    year: validDate.getFullYear(),
  }
}

