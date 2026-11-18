"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import {
    RestoreRecurrenceSchema,
    type RestoreRecurrenceInput,
} from "@/modules/recurrences/models/schemas/recurrence-status.schema";
import { failure, type Result } from "@/types/result.types";

export interface RestoreRecurrenceActionResult {
    id: number;
    name: string;
}

export async function restoreRecurrenceAction(
    input: RestoreRecurrenceInput
): Promise<Result<RestoreRecurrenceActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = RestoreRecurrenceSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const result = await RecurrenceFactory.makeRestoreRecurrenceUseCase().execute({
        session,
        data: parsed.data,
    });

    if (result.success) {
        revalidatePath("/recurrences", "layout");
    }
    return result;
}
