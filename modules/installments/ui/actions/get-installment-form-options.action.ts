"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { InstallmentFactory } from "@/modules/installments/infra/factories/installment.factory";
import { failure } from "@/types/result.types";

export async function getInstallmentFormOptionsAction() {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = InstallmentFactory.makeGetInstallmentFormOptionsUseCase();
    return await useCase.execute({ session });
}
