"use server";

import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    ContractCycleProfile,
    CycleEntryRow,
    CycleRange,
    CycleRangeSchema,
} from "@/modules/cycles/models/contract-cycle.schema";
import { CycleFactory } from "@/modules/cycles/infra/factories/cycle.factory";

export interface ContractCycleProfileActionResult {
    cycle: ContractCycleProfile;
    entries: CycleEntryRow[];
}

export async function resolveCurrentContractCycleAction(
    contractId: number
): Promise<Result<CycleRange>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    if (!contractId || contractId <= 0) {
        return failure("ID do contrato inválido");
    }

    const useCase = CycleFactory.makeResolveCurrentContractCycleUseCase();
    return useCase.execute({
        session,
        contractId,
    });
}

export async function getContractCycleProfileAction(
    contractId: number,
    range: CycleRange
): Promise<Result<ContractCycleProfileActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    if (!contractId || contractId <= 0) {
        return failure("ID do contrato inválido");
    }

    const parsedRange = CycleRangeSchema.safeParse(range);
    if (!parsedRange.success) {
        return failure(
            parsedRange.error.issues[0]?.message ?? "Período do ciclo inválido"
        );
    }

    const useCase = CycleFactory.makeGetContractCycleProfileUseCase();
    return useCase.execute({
        session,
        contractId,
        range: parsedRange.data,
    });
}
