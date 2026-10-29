"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import {
    AgreementDetail,
    GetAgreementDetailInput,
    GetAgreementDetailInputSchema,
} from "@/modules/contracts/models/agreement-detail.schema";
import { ContractFactory } from "@/modules/contracts/infra/factories/contract.factory";

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

    const useCase = ContractFactory.makeGetAgreementDetailUseCase();
    return useCase.execute({
        session,
        input: parsed.data,
    });
}
