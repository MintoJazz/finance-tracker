"use server"

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { failure, type Result } from "@/types/result.types"
import type {
  GetObligationContractsParams,
  ObligationContractItem,
} from "../../application/interfaces/obligation-contracts-queries.interface"
import { OperationOptionsFactory } from "../../infra/factories/operation-options.factory"

export async function getObligationContractsAction(
  params: GetObligationContractsParams
): Promise<Result<ObligationContractItem[]>> {
  const session = await SessionHandler.getSession()
  if (!session) {
    return failure("Não autenticado")
  }

  try {
    const useCase = OperationOptionsFactory.makeGetObligationContractsUseCase()
    return await useCase.execute({
      session,
      params,
    })
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Não foi possível buscar a lista de compromissos."
    return failure(message)
  }
}

