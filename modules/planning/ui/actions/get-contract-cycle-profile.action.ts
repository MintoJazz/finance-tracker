"use server";

import { failure, Result, success } from "@/types/result.types";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import {
    ContractCycleProfile,
    CycleEntryRow,
    CycleRange,
    CycleRangeSchema,
} from "../../core/schemas/contract-cycle.schema";
import {
    getContractCycleProfileMock,
    resolveCurrentCycleRange,
} from "../../infra/mock/contract-cycle.mock";

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

    const range = resolveCurrentCycleRange(contractId);
    return success(range);
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

    // A fronteira para na Server Action consumindo o mock
    const result = getContractCycleProfileMock(contractId, parsedRange.data);
    if (!result) {
        return failure("Ciclo não encontrado para o contrato informado.");
    }

    return success(result);
}
