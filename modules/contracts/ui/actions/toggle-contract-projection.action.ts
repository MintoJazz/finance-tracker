"use server";

import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { revalidatePath } from "next/cache";
import { Result, failure, success } from "@/types/result.types";

export async function toggleContractProjectionAction(
  id: number,
  includeInProjection: boolean
): Promise<Result<void>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  const useCase = ContractFactory.makeToggleContractProjectionUseCase();
  const result = await useCase.execute({ session, id, includeInProjection });

  if (!result.success) {
    return failure(result.error ?? "Falha ao atualizar projeção do contrato");
  }

  revalidatePath("/contracts", "layout");
  return success(undefined);
}
