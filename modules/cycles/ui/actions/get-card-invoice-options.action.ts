"use server";

import { z } from "zod";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CycleFactory } from "@/modules/cycles/infra/factories/cycle.factory";
import {
    CycleOption,
    CycleOptionSchema,
} from "@/modules/cycles/models/cycle-option.schema";
import {
    CycleStatus,
    CycleStatusSchema,
} from "@/modules/cycles/models/cycle-primitives.schema";
import { failure, Result, success } from "@/types/result.types";

export interface GetCardInvoiceOptionsActionDTO {
    balanceId: number;
    offset?: number;
    statuses?: CycleStatus[];
}

export async function getCardInvoiceOptionsAction(
    dto: GetCardInvoiceOptionsActionDTO
): Promise<Result<CycleOption[]>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    if (!dto.balanceId || dto.balanceId <= 0) {
        return failure("Identificador de cartão inválido.");
    }

    if (dto.offset !== undefined && !Number.isInteger(dto.offset)) {
        return failure("Deslocamento de ano inválido.");
    }

    if (dto.statuses) {
        const parsedStatuses = z.array(CycleStatusSchema).safeParse(dto.statuses);
        if (!parsedStatuses.success) {
            return failure("Filtro de status inválido.");
        }
    }

    const useCase = CycleFactory.makeGetCardInvoiceOptionsUseCase();
    const result = await useCase.execute({
        session,
        balanceId: dto.balanceId,
        offset: dto.offset,
        statuses: dto.statuses,
    });

    if (!result.success || !result.data) {
        return failure(result.error ?? "Erro ao carregar faturas do cartão.");
    }

    const validated = z.array(CycleOptionSchema).safeParse(result.data);
    if (!validated.success) {
        console.error(
            "[getCardInvoiceOptionsAction] Erro de validação de schema:",
            validated.error
        );
        return success(result.data);
    }

    return success(validated.data);
}

