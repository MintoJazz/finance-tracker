"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    ChangeInstallmentCardSchema,
    type ChangeInstallmentCardValues,
} from "@/modules/installments/models/schemas/installment-card.schema";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para troca de cartão (exclusiva para parcelamentos Em Fatura).
 * A persistência real será conectada no próximo ciclo de backend.
 */
export async function changeInstallmentCardAction(
    id: number,
    input: ChangeInstallmentCardValues
): Promise<Result<ChangeInstallmentCardValues & { id: number; mocked: true }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Sessão inválida. Faça login novamente.");

    const parsed = ChangeInstallmentCardSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Selecione um cartão válido.");
    }

    return success({ id, ...parsed.data, mocked: true });
}
