"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import {
    SetRecurrenceActiveSchema,
    type SetRecurrenceActiveInput,
} from "@/modules/recurrences/models/schemas/recurrence-status.schema";
import { failure, type Result } from "@/types/result.types";

export interface SetRecurrenceActiveActionResult {
    id: number;
    name: string;
    isActive: boolean;
}

export async function setRecurrenceActiveAction(
    input: SetRecurrenceActiveInput
): Promise<Result<SetRecurrenceActiveActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = SetRecurrenceActiveSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const result = await RecurrenceFactory.makeSetRecurrenceActiveUseCase().execute({
        session,
        data: parsed.data,
    });

    if (result.success) {
        revalidatePath("/recurrences", "layout");
    }
    return result;
}
