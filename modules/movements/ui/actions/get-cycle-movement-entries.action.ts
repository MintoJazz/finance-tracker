"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    GetBalanceMovementEntriesDTO,
    GetBalanceMovementEntriesDTOSchema,
    MovementEntry,
} from "@/modules/movements/models/movement-entry.schema";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";

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
    return await useCase.executeEntries({
        session,
        cardId: parsed.data.balanceId,
        pageRequest: {
            page: parsed.data.pageRequest?.page ?? 1,
            pageSize: parsed.data.pageRequest?.pageSize ?? 10,
        },
        filter: parsed.data.filter,
    });
}

export async function getContractCycleMovementEntriesAction(
    dto: GetBalanceMovementEntriesDTO
): Promise<Result<Page<MovementEntry>>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetBalanceMovementEntriesDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de busca do ciclo inválidos"
        );
    }

    const useCase = MovementFactory.makeGetContractCycleMovementsUseCase();
    return await useCase.execute({
        session,
        contractId: parsed.data.balanceId,
        pageRequest: {
            page: parsed.data.pageRequest?.page ?? 1,
            pageSize: parsed.data.pageRequest?.pageSize ?? 10,
        },
        filter: parsed.data.filter,
    });
}

