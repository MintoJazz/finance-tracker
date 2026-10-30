"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";
import {
  AdjustContractLimitsFormSchema,
  AdjustContractLimitsFormValues,
} from "@/modules/contracts/models/adjust-contract-limits-form.schema";
import { revalidatePath } from "next/cache";
import { Result, failure, success } from "@/types/result.types";

export async function adjustContractLimitsAction(
  contractId: number,
  data: AdjustContractLimitsFormValues
): Promise<Result<void>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  const parsed = AdjustContractLimitsFormSchema.safeParse(data);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados de limite inválidos");
  }

  const useCase = ContractFactory.makeAdjustContractLimitsUseCase();
  const result = await useCase.execute({
    session,
    contractId,
    data: parsed.data,
  });

  if (!result.success) {
    return failure(result.error ?? "Falha ao ajustar limites do contrato");
  }

  revalidatePath("/contracts", "layout");
  return success(undefined);
}

