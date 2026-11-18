"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { AgreementFactory } from "@/modules/agreements/infra/factories/agreement.factory";
import {
    AdjustRecurrenceAmountInputSchema,
    type AdjustRecurrenceAmountInput,
} from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";
import { failure, type Result } from "@/types/result.types";

export interface AdjustRecurrenceAmountActionResult {
    id: number;
    name: string;
    effectiveAt: string;
    amount: number;
}

export async function adjustRecurrenceAmountAction(
    input: AdjustRecurrenceAmountInput
): Promise<Result<AdjustRecurrenceAmountActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = AdjustRecurrenceAmountInputSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const { balanceId, ...data } = parsed.data;
    const useCase = AgreementFactory.makeAdjustAgreementAmountUseCase();
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
