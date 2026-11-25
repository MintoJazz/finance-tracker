"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    AdjustMonthlyDueDaySchema,
    type AdjustMonthlyDueDayValues,
} from "@/modules/installments/models/schemas/installment-deadlines.schema";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para ajuste do dia de vencimento em parcelamentos Mês a Mês (MONTHLY).
 * A persistência real será conectada no próximo ciclo de backend.
 */
export async function adjustInstallmentDeadlinesAction(
    id: number,
    payload: AdjustMonthlyDueDayValues
): Promise<Result<{ id: number; dueDay: number; mocked: true }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Sessão inválida. Faça login novamente.");

    if (!Number.isInteger(id) || id <= 0) {
        return failure("Parcelamento inválido.");
    }

    const parsed = AdjustMonthlyDueDaySchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dia de vencimento inválido.");
    }

    return success({ id, dueDay: parsed.data.dueDay, mocked: true });
}
