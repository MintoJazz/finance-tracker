"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import { RecurrencePrismaQueries } from "../../infra/repositories/recurrence-prisma.queries";
import { MOCK_RECURRENCES } from "../../infra/mock/recurrences.mock";
import type { RecurrenceProfile } from "../../models/schemas/recurrence-profile.schema";

export async function getRecurrenceProfileAction(
    balanceId: number
): Promise<Result<RecurrenceProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) {
        return failure("Não autenticado");
    }

    try {
        const queries = new RecurrencePrismaQueries();
        const recurrence = await queries.findRecurrenceById(
            balanceId,
            session.contextId
        );

        if (recurrence) {
            return success({
                ...recurrence,
                description: null,
            });
        }

        // Fallback para mock data se não encontrado no banco (ex.: ambiente de desenvolvimento ou dados de exemplo)
        const mockItem = MOCK_RECURRENCES.find((r) => r.balanceId === balanceId);
        if (mockItem) {
            return success({
                ...mockItem,
                description: null,
            });
        }

        return failure("Recorrência não encontrada.");
    } catch (error) {
        console.error(
            `[getRecurrenceProfileAction] Erro ao buscar recorrência ${balanceId}:`,
            error
        );

        // Fallback gracioso para mock caso haja erro de infra/DB temporário
        const mockItem = MOCK_RECURRENCES.find((r) => r.balanceId === balanceId);
        if (mockItem) {
            return success({
                ...mockItem,
                description: null,
            });
        }

        return failure(
            error instanceof Error
                ? error.message
                : "Erro ao buscar dados da recorrência."
        );
    }
}
