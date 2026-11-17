"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import { RecurrenceFactory } from "../../infra/factories/recurrence.factory";
import type { RecurrenceProfile } from "../../models/schemas/recurrence-profile.schema";

export async function getRecurrenceProfileAction(
    balanceId: number
): Promise<Result<RecurrenceProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) {
        return failure("Não autenticado");
    }

    try {
        const useCase = RecurrenceFactory.makeGetRecurrenceProfileUseCase();
        return await useCase.execute({
            session,
            balanceId,
        });
    } catch (error) {
        console.error(
            `[getRecurrenceProfileAction] Erro ao buscar recorrência ${balanceId}:`,
            error
        );
        return failure(
            error instanceof Error
                ? error.message
                : "Erro ao buscar dados da recorrência."
        );
    }
}
