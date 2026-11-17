"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import {
    RecurrenceCycleFilters,
    RecurrenceCycleFiltersSchema,
    RecurrenceCyclesResult,
} from "../../models/schemas/recurrence-cycle-filters.schema";
import { RecurrenceFactory } from "../../infra/factories/recurrence.factory";

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
        const useCase = RecurrenceFactory.makeGetRecurrenceCyclesUseCase();

        return await useCase.execute({
            session,
            balanceId,
            filters: validatedFilters,
        });
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
