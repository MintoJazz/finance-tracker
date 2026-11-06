import { z } from "zod"

export const InstallmentsSliceSchema = z.object({
  count: z
    .number({ error: "Selecione a quantidade de parcelas" })
    .int()
    .min(2, "Mínimo de 2 parcelas")
    .max(48, "Máximo de 48 parcelas"),
  intervalDays: z
    .number({ error: "Selecione o intervalo entre parcelas" })
    .int()
    .min(1, "Intervalo mínimo de 1 dia")
    .max(365, "Intervalo máximo de 365 dias"),
})

export type InstallmentsSlice = z.infer<typeof InstallmentsSliceSchema>

