import { z } from "zod"

export const ReimbursementSliceSchema = z.object({
  targetIds: z
    .array(z.string().min(1))
    .min(1, "Selecione pelo menos um contato ou grupo para reembolso"),
  reimbursedAmount: z
    .number({ error: "Informe o valor a recuperar" })
    .int()
    .positive("O valor a recuperar deve ser maior que zero"),
})

export type ReimbursementSlice = z.infer<typeof ReimbursementSliceSchema>

