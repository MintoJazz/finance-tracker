"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import { failure } from "@/types/result.types";

export async function getRecurrenceFormOptionsAction() {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = RecurrenceFactory.makeGetRecurrenceFormOptionsUseCase();
    return await useCase.execute({ session });
}
