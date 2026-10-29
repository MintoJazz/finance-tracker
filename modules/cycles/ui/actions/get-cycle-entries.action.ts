"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import {
    CycleEntryItem,
    GetCycleEntriesInput,
    GetCycleEntriesInputSchema,
} from "@/modules/cycles/models/cycle-entries.schema";
import { CycleFactory } from "@/modules/cycles/infra/factories/cycle.factory";

export async function getCycleEntriesAction(
    input: GetCycleEntriesInput
): Promise<Result<Page<CycleEntryItem>>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetCycleEntriesInputSchema.safeParse(input);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros para consulta do extrato do ciclo inválidos"
        );
    }

    const useCase = CycleFactory.makeGetCycleEntriesUseCase();
    return useCase.execute({
        session,
        input: parsed.data,
    });
}
