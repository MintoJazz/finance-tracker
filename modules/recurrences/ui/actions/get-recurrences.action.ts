"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure } from "@/types/result.types";
import { RecurrenceFactory } from "../../infra/factories/recurrence.factory";
import type { RecurrenceFilters } from "../../models/schemas/recurrence-item.schema";

export async function getRecurrencesAction(filter?: RecurrenceFilters) {
    const session = await SessionHandler.getSession();
    if (!session) {
        return failure("Não autenticado");
    }

    const useCase = RecurrenceFactory.makeGetContextRecurrencesUseCase();
    return await useCase.execute({ session, filter });
}

