"use server";

import { PlanningFactory } from "../../infra/factories/planning.factory";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { revalidatePath } from "next/cache";
import { Result, failure, success } from "@/types/result.types";

export async function archiveContractAction(id: number): Promise<Result<void>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  const useCase = PlanningFactory.makeArchiveContractUseCase();
  const result = await useCase.execute({ session, id });

  if (!result.success) {
    return failure(result.error ?? "Falha ao arquivar contrato");
  }

  revalidatePath("/contracts", "layout");
  return success(undefined);
}
