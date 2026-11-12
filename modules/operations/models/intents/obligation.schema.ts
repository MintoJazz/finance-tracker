import { z } from "zod"
import { CycleStatusSchema } from "@/modules/cycles/models/obligation-cycle.schema"
import type { IntentInitialSliceContext } from "../../application/intents/types"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de referência inválida (YYYY-MM-DD)")

export const ObligationAllocationSchema = z.object({
  referenceDate: isoDate,
  amount: z
    .number({ error: "Informe o valor do ciclo" })
    .int("O valor deve ser em centavos")
    .positive("O valor deve ser maior que zero"),
  status: CycleStatusSchema.optional().default("OPEN"),
})

export type ObligationAllocation = z.infer<typeof ObligationAllocationSchema>

export const ObligationSliceSchema = z.object({
  agreementId: z
    .number({ error: "Selecione um contrato" })
    .int()
    .positive("Selecione um contrato"),
  contractName: z.string().optional(),
  allocations: z
    .array(ObligationAllocationSchema)
    .min(1, "Selecione ao menos um ciclo para quitar")
    .refine(
      (a) => new Set(a.map((x) => x.referenceDate)).size === a.length,
      "Ciclo repetido na seleção"
    ),
})

export type ObligationSlice = z.infer<typeof ObligationSliceSchema>

export function buildInitialObligationIntentSlice(
  ctx: IntentInitialSliceContext
): Partial<ObligationSlice> {
  const agreementId = ctx.seed?.agreementId
  const cycleRef = ctx.seed?.cycleReferenceDate
  const amount = ctx.seed?.amount
  const contractName =
    (ctx.seed as any)?.contractName ||
    ctx.lookups?.custodies?.find((c) => c.id === agreementId)?.name ||
    ctx.seed?.description?.match(/^(?:Quitação|Recebimento)\s*-\s*(.+)$/i)?.[1]?.trim() ||
    undefined

  if (agreementId && cycleRef && amount && amount > 0) {
    return {
      agreementId,
      contractName,
      allocations: [
        {
          referenceDate: cycleRef,
          amount,
          status: "OPEN",
        },
      ],
    }
  }

  if (agreementId) {
    return {
      agreementId,
      contractName,
      allocations: [],
    }
  }

  return {
    allocations: [],
  }
}

