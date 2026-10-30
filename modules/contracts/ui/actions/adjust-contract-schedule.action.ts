"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";
import {
  AdjustContractScheduleFormSchema,
  AdjustContractScheduleFormValues,
} from "@/modules/contracts/models/adjust-contract-schedule-form.schema";
import { revalidatePath } from "next/cache";
import { Result, failure, success } from "@/types/result.types";

export async function adjustContractScheduleAction(
  contractId: number,
  data: AdjustContractScheduleFormValues
): Promise<Result<void>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  const parsed = AdjustContractScheduleFormSchema.safeParse(data);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados de agendamento inválidos");
  }

  const useCase = ContractFactory.makeAdjustContractScheduleUseCase();
  const result = await useCase.execute({
    session,
    contractId,
    data: parsed.data,
  });

  if (!result.success) {
    return failure(result.error ?? "Falha ao ajustar prazos do contrato");
  }

  revalidatePath("/contracts", "layout");
  return success(undefined);
}

