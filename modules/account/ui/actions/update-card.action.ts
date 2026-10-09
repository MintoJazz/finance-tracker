"use server"

import {
  UpdateCardSchema,
  UpdateCardInput,
} from "@/modules/account/core/schemas/card.schema"
import { failure, Result } from "@/types/result.types"
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler"
import { AccountFactory } from "@/modules/account/infra/factories/account.factory"
import { revalidatePath } from "next/cache"

export interface UpdateCardActionResult {
  id: number
  name: string
}

export async function updateCardAction(
  input: UpdateCardInput
): Promise<Result<UpdateCardActionResult>> {
  const session = await SessionHandler.getSession()
  if (!session) return failure("Não autenticado")

  const parsed = UpdateCardSchema.safeParse(input)
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const useCase = AccountFactory.makeUpdateCardUseCase()
  const result = await useCase.execute({ session, data: parsed.data })

  if (result.success) {
    revalidatePath("/cards", "layout")
  }

  return result
}
