"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import {
    RecurrenceCycleFilters,
    RecurrenceCycleFiltersSchema,
    RecurrenceCyclesResult,
} from "../../models/schemas/recurrence-cycle-filters.schema";
import { getRecurrenceProfileAction } from "./get-recurrence-profile.action";
import { generateMockRecurrenceCycles } from "../../infra/mock/recurrence-cycles.mock";

export async function getRecurrenceCyclesAction(
    balanceId: number,
    filters?: Partial<RecurrenceCycleFilters>
): Promise<Result<RecurrenceCyclesResult>> {
    const session = await SessionHandler.getSession();
    if (!session) {
        return failure("Não autenticado");
    }

    try {
        const validatedFilters = RecurrenceCycleFiltersSchema.parse(filters ?? {});

        // Obtém a recorrência para conhecer frequência, vencimento e valor base
        const profileResult = await getRecurrenceProfileAction(balanceId);
        if (!profileResult.success || !profileResult.data) {
            return failure(
                profileResult.error ?? "Recorrência não encontrada para listar ciclos."
            );
        }

        const recurrence = profileResult.data;
        const result = generateMockRecurrenceCycles(recurrence, validatedFilters);

        return success(result);
    } catch (error) {
        console.error(
            `[getRecurrenceCyclesAction] Erro ao buscar ciclos para recorrência ${balanceId}:`,
            error
        );
        return failure(
            error instanceof Error
                ? error.message
                : "Erro inesperado ao buscar ciclos da recorrência."
        );
    }
}

