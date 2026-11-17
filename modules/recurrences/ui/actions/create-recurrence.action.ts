"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    CreateRecurrenceSchema,
    type CreateRecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import { failure, type Result } from "@/types/result.types";

export interface CreateRecurrenceActionResult {
    id: number;
    name: string;
}

export async function createRecurrenceAction(
    formData: CreateRecurrenceFormValues
): Promise<Result<CreateRecurrenceActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = CreateRecurrenceSchema.safeParse(formData);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const useCase = RecurrenceFactory.makeCreateRecurrenceUseCase();
    const result = await useCase.execute({ session, data: parsed.data });

    if (result.success) {
        revalidatePath("/recurrences", "layout");
        // Categoria/subcategoria podem ter sido criadas junto com a recorrência
        revalidatePath("/categories", "layout");
    }

    return result;
}
