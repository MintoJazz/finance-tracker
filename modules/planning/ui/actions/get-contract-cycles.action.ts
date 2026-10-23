"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import {
    ContractCycleItem,
    GetContractCyclesDTO,
    GetContractCyclesDTOSchema,
} from "../../core/schemas/contract-cycle.schema";
import { PlanningFactory } from "../../infra/factories/planning.factory";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";

export async function getContractCyclesAction(
    dto: GetContractCyclesDTO
): Promise<Result<Page<ContractCycleItem>>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetContractCyclesDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ?? "Parâmetros de consulta dos ciclos inválidos"
        );
    }

    const useCase = PlanningFactory.makeGetContractCyclesUseCase();
    return useCase.execute({
        session,
        contractId: parsed.data.contractId,
        pageRequest: parsed.data.pageRequest,
        filter: parsed.data.filter,
    });
}
