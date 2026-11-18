"use server"

import { revalidatePath } from "next/cache"
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { AgreementFactory } from "@/modules/agreements/infra/factories/agreement.factory"
import {
  AdjustCardDeadlinesInputSchema,
  type AdjustCardDeadlinesInput,
} from "@/modules/cards/models/card-adjustment.schema"
import { failure, type Result } from "@/types/result.types"

export interface AdjustCardDeadlinesActionResult {
  id: number
  name: string
  effectiveFrom: string
}

export async function adjustCardDeadlinesAction(
  input: AdjustCardDeadlinesInput
): Promise<Result<AdjustCardDeadlinesActionResult>> {
  const session = await SessionHandler.getSession()
  if (!session) return failure("Não autenticado")

  const parsed = AdjustCardDeadlinesInputSchema.safeParse(input)
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const { id, ...data } = parsed.data
  const useCase = AgreementFactory.makeAdjustAgreementDeadlinesUseCase()
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
