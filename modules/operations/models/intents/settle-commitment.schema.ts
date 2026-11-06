import { z } from "zod"

export const SettleCommitmentSliceSchema = z.object({
  commitmentId: z
    .number({ error: "Selecione um compromisso em aberto" })
    .int()
    .positive("Selecione um compromisso em aberto"),
})

export type SettleCommitmentSlice = z.infer<typeof SettleCommitmentSliceSchema>

