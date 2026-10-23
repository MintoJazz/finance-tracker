"use server";

import { failure, Result } from "@/types/result.types";
import {
    ContractProfile,
    GetContractProfileSchema,
} from "../../core/schemas/contract-profile.schema";
import { PlanningFactory } from "../../infra/factories/planning.factory";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";

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

    const useCase = PlanningFactory.makeGetContractProfileUseCase();
    return useCase.execute({
        session,
        contractId: parsed.data.id,
    });
}
