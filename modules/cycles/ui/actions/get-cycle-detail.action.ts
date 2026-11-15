"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, Result, success } from "@/types/result.types";
import {
    CycleDetail,
    CycleDetailSchema,
} from "@/modules/cycles/models/cycle-detail.schema";
import {
    CycleRange,
    CycleRangeSchema,
} from "@/modules/cycles/models/cycle-primitives.schema";
import { MovementEntryScope } from "@/modules/movements/models/movement-entry.schema";
import { CycleFactory } from "@/modules/cycles/infra/factories/cycle.factory";
import { mapCycleDetailOutputToCycleDetail } from "@/modules/cycles/infra/mappers/cycle-detail.mapper";

export interface GetCycleDetailActionDTO {
    balanceId: number;
    range?: CycleRange;
    scope?: MovementEntryScope;
}

export async function getCycleDetailAction(
    dto: GetCycleDetailActionDTO
): Promise<Result<CycleDetail>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    if (!dto.balanceId || dto.balanceId <= 0) {
        return failure("Identificador de saldo inválido.");
    }

    if (dto.range) {
        const parsedRange = CycleRangeSchema.safeParse(dto.range);
        if (!parsedRange.success) {
            return failure("Período de ciclo inválido.");
        }
    }

    const useCase = CycleFactory.makeGetCycleDetailUseCase();
    const result = await useCase.execute({
        session,
        balanceId: dto.balanceId,
        range: dto.range,
    });

    if (!result.success || !result.data) {
        return failure(result.error ?? "Erro ao carregar detalhes do ciclo.");
    }

    const mapped = mapCycleDetailOutputToCycleDetail(result.data);
    const validated = CycleDetailSchema.safeParse(mapped);

    if (!validated.success) {
        console.error(
            "[getCycleDetailAction] Erro de validação de schema:",
            validated.error
        );
        return success(mapped);
    }

    return success(validated.data);
}

