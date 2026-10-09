"use server";

import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import {
    AgreementDetail,
    GetAgreementDetailInput,
    GetAgreementDetailInputSchema,
} from "../../core/schemas/agreement-detail.schema";
import { PlanningFactory } from "../../infra/factories/planning.factory";

export async function getAgreementDetailAction(
    input: GetAgreementDetailInput
): Promise<Result<AgreementDetail>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetAgreementDetailInputSchema.safeParse(input);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros para consulta do compromisso inválidos"
        );
    }

    const useCase = PlanningFactory.makeGetAgreementDetailUseCase();
    return useCase.execute({
        session,
        input: parsed.data,
    });
}
