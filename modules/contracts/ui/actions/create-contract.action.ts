"use server";

import { ContractFormSchema, ContractFormValues } from "@/modules/contracts/models/contract-form.schema";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";
import { revalidatePath } from "next/cache";
import { Result, failure } from "@/types/result.types";

export async function createContractAction(
  data: ContractFormValues
): Promise<Result<{ id: number; balanceId: number; name: string }>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  const parsed = ContractFormSchema.safeParse(data);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados do contrato inválidos");
  }

  const useCase = ContractFactory.makeCreateContractUseCase();
  const result = await useCase.execute({ session, data: parsed.data });

  if (result.success) {
    revalidatePath("/contracts", "layout");
  }

  return result;
}
