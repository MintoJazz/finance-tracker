"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    AdjustInstallmentValuesSchema,
    type AdjustInstallmentValuesValues,
} from "@/modules/installments/models/schemas/installment-values.schema";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para o fluxo exclusivo de Valores e Parcelas.
 * A persistência real será conectada no próximo ciclo de backend.
 */
export async function adjustInstallmentValuesAction(
    id: number,
    input: AdjustInstallmentValuesValues
): Promise<Result<AdjustInstallmentValuesValues & { id: number; mocked: true }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Sessão inválida. Faça login novamente.");

    const parsed = AdjustInstallmentValuesSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    return success({ id, ...parsed.data, mocked: true });
}
