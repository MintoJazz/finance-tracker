"use server"

import { revalidatePath } from "next/cache"
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { failure, type Result } from "@/types/result.types"
import type { OperationExecutionResult } from "../../application/plan/types"
import { OperationOptionsFactory } from "../../infra/factories/operation-options.factory"
import type { OperationDraft } from "../../models/operation-input.schema"
import type { OperationSeed } from "../../models/operation-seed.schema"

export interface ExecuteOperationActionInput {
  readonly payload: Partial<OperationDraft>
  readonly seed?: OperationSeed
}

export async function executeOperationAction(
  input: ExecuteOperationActionInput
): Promise<Result<OperationExecutionResult>> {
  const session = await SessionHandler.getSession()
  if (!session) {
    return failure("Não autenticado")
  }

  try {
    const useCase = OperationOptionsFactory.makeExecuteOperationUseCase()
    const result = await useCase.execute({
      session,
      payload: input.payload,
      seed: input.seed,
    })

    if (result.success) {
      revalidatePath("/operations", "layout")
      revalidatePath("/wallets", "layout")
      revalidatePath("/cards", "layout")
      revalidatePath("/categories", "layout")
      revalidatePath("/commitments", "layout")
      revalidatePath("/contracts", "layout")
    }

    return result
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Não foi possível registrar a operação."
    return failure(message)
  }
}

