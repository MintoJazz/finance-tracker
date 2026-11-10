"use server"

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { failure, type Result } from "@/types/result.types"
import type { OperationOptions } from "../../models/operation-options.schema"
import { OperationOptionsFactory } from "../../infra/factories/operation-options.factory"

export async function getOperationOptionsAction(): Promise<Result<OperationOptions>> {
  const session = await SessionHandler.getSession()
  if (!session) {
    return failure("Não autenticado")
  }

  const useCase = OperationOptionsFactory.makeGetOperationOptionsUseCase()
  return useCase.execute({ session })
}
