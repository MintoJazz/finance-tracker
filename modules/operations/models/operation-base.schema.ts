import { z } from "zod"
import { CustodyBalanceTypeSchema } from "./operation-seed.schema"

export const BaseOperationSliceSchema = z.object({
  custodyBalanceId: z
    .number({ error: "Selecione onde a operação será custodiada" })
    .int()
    .positive("Selecione uma carteira, cartão ou reserva"),
  custodyType: CustodyBalanceTypeSchema.default("WALLET"),
  amount: z
    .number({ error: "Informe o valor da operação" })
    .int("O valor deve ser em centavos")
    .positive("O valor deve ser maior que zero"),
  dueDate: z
    .string({ error: "Informe a data de vencimento/liquidação" })
    .min(1, "Informe a data de vencimento/liquidação"),
  competanceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de competência inválida (YYYY-MM-DD)")
    .nullable()
    .optional(),
  description: z
    .string({ error: "Informe uma descrição para a operação" })
    .trim()
    .min(1, "Informe uma descrição para a operação")
    .max(120, "A descrição deve ter no máximo 120 caracteres"),
  categoryId: z
    .number({ error: "Selecione uma categoria" })
    .int()
    .positive("Selecione uma categoria")
    .nullable()
    .optional(),
  subcategoryId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
})

export type BaseOperationSlice = z.infer<typeof BaseOperationSliceSchema>

