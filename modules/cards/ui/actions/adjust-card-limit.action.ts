"use server"

import { revalidatePath } from "next/cache"
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { AgreementFactory } from "@/modules/agreements/infra/factories/agreement.factory"
import {
  AdjustCardLimitInputSchema,
  type AdjustCardLimitInput,
} from "@/modules/cards/models/card-adjustment.schema"
import { failure, type Result } from "@/types/result.types"

export interface AdjustCardLimitActionResult {
  id: number
  name: string
  effectiveAt: string
  amount: number
}

export async function adjustCardLimitAction(
  input: AdjustCardLimitInput
): Promise<Result<AdjustCardLimitActionResult>> {
  const session = await SessionHandler.getSession()
  if (!session) return failure("Não autenticado")

  const parsed = AdjustCardLimitInputSchema.safeParse(input)
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const { id, ...data } = parsed.data
  const useCase = AgreementFactory.makeAdjustAgreementAmountUseCase()
  const result = await useCase.execute({
    session,
    scope: "CARD",
    balanceId: id,
    data,
  })

  if (!result.success) return result

  revalidatePath("/cards", "layout")
  return result
}
