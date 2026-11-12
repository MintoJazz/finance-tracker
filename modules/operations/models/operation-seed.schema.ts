import { z } from "zod"

export const OperationNatureSchema = z.enum(["PAY", "RECEIVE"])
export type OperationNature = z.infer<typeof OperationNatureSchema>

export const CustodyBalanceTypeSchema = z.enum(["WALLET", "CREDIT", "RESERVE"])
export type CustodyBalanceType = z.infer<typeof CustodyBalanceTypeSchema>

export const OperationSeedSchema = z.object({
  nature: OperationNatureSchema.optional(),
  intents: z.array(z.string()).optional(),
  agreementId: z.number().int().positive().optional(),
  cycleReferenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  custodyBalanceId: z.number().int().positive().optional(),
  custodyType: CustodyBalanceTypeSchema.optional(),
  categoryId: z.number().int().positive().optional(),
  subcategoryId: z.number().int().positive().optional(),
  amount: z.number().int().positive().optional(),
  description: z.string().trim().max(120).optional(),
  dueDate: z.string().optional(),
  competanceDate: z.string().optional(),
})

export type OperationSeed = z.infer<typeof OperationSeedSchema>

/**
 * Faz o parse seguro de query params para OperationSeed, ignorando campos inválidos.
 */
export function parseOperationSeedFromSearchParams(
  raw: Record<string, string | string[] | undefined>
): OperationSeed {
  const seed: OperationSeed = {}

  const nature = typeof raw.nature === "string" ? raw.nature : undefined
  const parsedNature = OperationNatureSchema.safeParse(nature)
  if (parsedNature.success) {
    seed.nature = parsedNature.data
  }

  const rawIntents = raw.intents
  if (typeof rawIntents === "string" && rawIntents.trim()) {
    seed.intents = rawIntents
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  } else if (Array.isArray(rawIntents)) {
    seed.intents = rawIntents.map((s) => s.trim()).filter(Boolean)
  }

  const parsePositiveInt = (val: unknown): number | undefined => {
    if (typeof val !== "string") return undefined
    const n = Number(val)
    return Number.isInteger(n) && n > 0 ? n : undefined
  }

  const custodyBalanceId = parsePositiveInt(raw.custodyBalanceId ?? raw.walletId)
  if (custodyBalanceId) seed.custodyBalanceId = custodyBalanceId

  const agreementId = parsePositiveInt(raw.agreementId ?? raw.contractId)
  if (agreementId) seed.agreementId = agreementId

  if (
    typeof raw.cycleReferenceDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(raw.cycleReferenceDate)
  ) {
    seed.cycleReferenceDate = raw.cycleReferenceDate
  }

  const parsedCustodyType = CustodyBalanceTypeSchema.safeParse(raw.custodyType)
  if (parsedCustodyType.success) {
    seed.custodyType = parsedCustodyType.data
  }

  const categoryId = parsePositiveInt(raw.categoryId)
  if (categoryId) seed.categoryId = categoryId

  const subcategoryId = parsePositiveInt(raw.subcategoryId)
  if (subcategoryId) seed.subcategoryId = subcategoryId

  const amount = parsePositiveInt(raw.amount)
  if (amount) seed.amount = amount

  if (typeof raw.description === "string" && raw.description.trim()) {
    seed.description = raw.description.trim().slice(0, 120)
  }

  if (typeof raw.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.dueDate)) {
    seed.dueDate = raw.dueDate
  }

  if (
    typeof raw.competanceDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(raw.competanceDate)
  ) {
    seed.competanceDate = raw.competanceDate
  }

  return seed
}

