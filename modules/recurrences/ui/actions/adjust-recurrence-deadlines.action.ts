"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { AgreementFactory } from "@/modules/agreements/infra/factories/agreement.factory";
import {
    AdjustRecurrenceDeadlinesInputSchema,
    type AdjustRecurrenceDeadlinesInput,
} from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";
import { failure, type Result } from "@/types/result.types";

export interface AdjustRecurrenceDeadlinesActionResult {
    id: number;
    name: string;
    effectiveFrom: string;
}

export async function adjustRecurrenceDeadlinesAction(
    input: AdjustRecurrenceDeadlinesInput
): Promise<Result<AdjustRecurrenceDeadlinesActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = AdjustRecurrenceDeadlinesInputSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    // A frequência do form só orienta os campos; o use case usa a do acordo.
    const { balanceId, frequency: _frequency, ...data } = parsed.data;
    void _frequency;
    const useCase = AgreementFactory.makeAdjustAgreementDeadlinesUseCase();
    const result = await useCase.execute({
        session,
        scope: "RECURRENCE",
        balanceId,
        data,
    });

    if (!result.success) return result;

    revalidatePath("/recurrences", "layout");
    return result;
}
