"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    MOCK_INSTALLMENTS,
    findMockInstallmentById,
} from "@/modules/installments/infra/mock/installments.mock";
import type {
    InstallmentListItem,
    InstallmentType,
} from "@/modules/installments/models/schemas/installment-item.schema";
import { failure, success, type Result } from "@/types/result.types";

/**
 * Server Action mockada para carregar um parcelamento pelo ID nos modais de ação.
 * Quando o backend for implementado, delegará para `InstallmentFactory.makeGetInstallmentByIdUseCase()`.
 */
export async function getInstallmentByIdAction(
    id: number,
    options?: { preferredType?: InstallmentType }
): Promise<Result<InstallmentListItem>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const exact = findMockInstallmentById(id);
    if (exact) return success(exact);

    const fallback = options?.preferredType
        ? MOCK_INSTALLMENTS.find(
              (item) =>
                  item.type === options.preferredType &&
                  !item.isArchived &&
                  item.consolidatedInstallments < item.totalInstallments
          )
        : MOCK_INSTALLMENTS.find(
              (item) =>
                  !item.isArchived &&
                  item.consolidatedInstallments < item.totalInstallments
          );

    if (!fallback) {
        return failure("Parcelamento não encontrado.");
    }

    return success({ ...fallback, id });
}
