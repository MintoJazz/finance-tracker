"use server";

import { ContractFormValues } from "../../core/schemas/contract-form.schema";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { revalidatePath } from "next/cache";
import { Result, failure, success } from "@/types/result.types";

export async function updateContractAction(
  _id: number,
  _data: ContractFormValues
): Promise<Result<void>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  // No escopo frontend, simulamos a resposta de atualização com sucesso
  revalidatePath("/contracts", "layout");
  return success(undefined);
}
