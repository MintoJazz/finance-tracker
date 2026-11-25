"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para arquivamento irreversível do parcelamento.
 * A persistência real será conectada no próximo ciclo de backend.
 */
export async function archiveInstallmentAction(
    id: number
): Promise<Result<{ id: number; mocked: true }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Sessão inválida. Faça login novamente.");

    if (!Number.isInteger(id) || id <= 0) {
        return failure("Parcelamento inválido.");
    }

    return success({ id, mocked: true });
}
