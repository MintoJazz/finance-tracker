"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";
import { RenameContractFormSchema } from "@/modules/contracts/models/rename-contract-form.schema";
import { revalidatePath } from "next/cache";
import { Result, failure, success } from "@/types/result.types";

export async function renameContractAction(
  contractId: number,
  name: string
): Promise<Result<void>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  const parsed = RenameContractFormSchema.safeParse({ name });
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Nome de contrato inválido");
  }

  const useCase = ContractFactory.makeRenameContractUseCase();
  const result = await useCase.execute({ session, contractId, name: parsed.data.name });

  if (!result.success) {
    return failure(result.error ?? "Falha ao renomear contrato");
  }

  revalidatePath("/contracts", "layout");
  return success(undefined);
}

