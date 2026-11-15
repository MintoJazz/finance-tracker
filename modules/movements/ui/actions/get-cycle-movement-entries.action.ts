"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    GetBalanceMovementEntriesDTO,
    GetBalanceMovementEntriesDTOSchema,
    MovementEntry,
    MovementEntryFilters,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";

export interface GetCycleMovementEntriesDTO extends GetBalanceMovementEntriesDTO {
    range?: CycleRange;
    scope?: MovementEntryScope;
}

export async function getCardMovementEntriesAction(
    dto: GetBalanceMovementEntriesDTO
): Promise<Result<Page<MovementEntry>>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetBalanceMovementEntriesDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de busca da fatura inválidos"
        );
    }

    const useCase = MovementFactory.makeGetCardMovementsUseCase();
    return await useCase.execute({
        session,
        cardId: parsed.data.balanceId,
        pageRequest: {
            page: parsed.data.pageRequest?.page ?? 1,
            pageSize: parsed.data.pageRequest?.pageSize ?? 10,
        },
        filter: parsed.data.filter,
    });
}

export async function getCycleMovementEntriesAction(
    dto: GetCycleMovementEntriesDTO
): Promise<Result<Page<MovementEntry>>> {
    const effectiveFilter: MovementEntryFilters = {
        ...dto.filter,
        includeReversed: dto.filter?.includeReversed ?? false,
        ...(dto.range && !dto.filter?.from ? { from: dto.range.from } : {}),
        ...(dto.range && !dto.filter?.to ? { to: dto.range.to } : {}),
    };

    const payload: GetBalanceMovementEntriesDTO = {
        balanceId: dto.balanceId,
        pageRequest: dto.pageRequest,
        filter: effectiveFilter,
    };

    return await getCardMovementEntriesAction(payload);
}
