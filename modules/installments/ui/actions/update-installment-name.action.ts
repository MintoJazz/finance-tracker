"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    UpdateInstallmentNameSchema,
    type UpdateInstallmentNameInput,
    type UpdateInstallmentNameValues,
} from "@/modules/installments/models/schemas/installment-edit.schema";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para edição cadastral (apenas Nome).
 * A persistência real será conectada no próximo ciclo de backend.
 */
export async function updateInstallmentNameAction(
    id: number,
    input: UpdateInstallmentNameInput
): Promise<Result<UpdateInstallmentNameValues & { id: number; mocked: true }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Sessão inválida. Faça login novamente.");

    const parsed = UpdateInstallmentNameSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    return success({ id, ...parsed.data, mocked: true });
}
