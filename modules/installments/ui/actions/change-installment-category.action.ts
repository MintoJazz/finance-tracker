"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    ChangeInstallmentCategorySchema,
    type ChangeInstallmentCategoryValues,
} from "@/modules/installments/models/schemas/installment-category.schema";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para troca de categoria (com escopo OPEN_ONLY ou ALL).
 * A persistência real será conectada no próximo ciclo de backend.
 */
export async function changeInstallmentCategoryAction(
    id: number,
    input: ChangeInstallmentCategoryValues
): Promise<Result<ChangeInstallmentCategoryValues & { id: number; mocked: true }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Sessão inválida. Faça login novamente.");

    const parsed = ChangeInstallmentCategorySchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    return success({ id, ...parsed.data, mocked: true });
}
