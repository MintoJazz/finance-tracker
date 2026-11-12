"use server"

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { failure, type Result } from "@/types/result.types"
import type { ObligationCyclesResponse } from "@/modules/cycles/models/obligation-cycle.schema"
import { CycleFactory } from "@/modules/cycles/infra/factories/cycle.factory"

export interface GetObligationCyclesActionInput {
  agreementId: number
  cursor?: string
  direction?: "before" | "after"
  limit?: number
}

export async function getObligationCyclesAction(
  input: GetObligationCyclesActionInput
): Promise<Result<ObligationCyclesResponse>> {
  const session = await SessionHandler.getSession()
  if (!session) {
    return failure("Não autenticado")
  }

  try {
    const useCase = CycleFactory.makeGetObligationCyclesUseCase()
    return await useCase.execute({
      session,
      agreementId: input.agreementId,
      cursor: input.cursor,
      direction: input.direction,
      limit: input.limit,
    })
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Não foi possível carregar os ciclos do compromisso."
    return failure(message)
  }
}

