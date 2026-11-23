"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { InstallmentFactory } from "@/modules/installments/infra/factories/installment.factory";
import {
    InstallmentFormSchema,
    type InstallmentFormValues,
} from "@/modules/installments/models/schemas/installment-form.schema";
import { failure, type Result } from "@/types/result.types";

export interface CreateInstallmentActionResult {
    id: number;
    name: string;
}

export async function createInstallmentAction(
    formData: InstallmentFormValues
): Promise<Result<CreateInstallmentActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = InstallmentFormSchema.safeParse(formData);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const useCase = InstallmentFactory.makeCreateInstallmentUseCase();
    const result = await useCase.execute({ session, data: parsed.data });

    if (result.success) {
        revalidatePath("/installments", "layout");
        // Categoria/subcategoria podem ter sido criadas junto com o parcelamento
        revalidatePath("/categories", "layout");
        // Em fatura, o limite usado e a fatura do cartão mudam
        revalidatePath("/cards", "layout");
    }

    return result;
}
