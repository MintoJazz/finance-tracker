"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import {
    EditRecurrenceInputSchema,
    type EditRecurrenceInput,
} from "@/modules/recurrences/models/schemas/recurrence-edit.schema";
import { failure, type Result } from "@/types/result.types";

export interface UpdateRecurrenceActionResult {
    id: number;
    name: string;
}

export async function updateRecurrenceAction(
    input: EditRecurrenceInput
): Promise<Result<UpdateRecurrenceActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = EditRecurrenceInputSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const result = await RecurrenceFactory.makeUpdateRecurrenceUseCase().execute({
        session,
        data: parsed.data,
    });

    if (result.success) {
        revalidatePath("/recurrences", "layout");
        // A edição pode criar categoria/subcategoria nova
        revalidatePath("/categories", "layout");
    }
    return result;
}
