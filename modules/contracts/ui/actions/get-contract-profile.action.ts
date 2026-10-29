"use server";

import { failure, Result } from "@/types/result.types";
import {
    ContractProfile,
    GetContractProfileSchema,
} from "@/modules/contracts/models/contract-profile.schema";
import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";

export async function getContractProfileAction(
    id: number
): Promise<Result<ContractProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetContractProfileSchema.safeParse({ id });
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ?? "Identificador do contrato inválido"
        );
    }

    const useCase = ContractFactory.makeGetContractProfileUseCase();
    return useCase.execute({
        session,
        contractId: parsed.data.id,
    });
}
