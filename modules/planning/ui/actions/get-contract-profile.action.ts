"use server";

import { failure, Result } from "@/types/result.types";
import {
    ContractProfile,
    GetContractProfileSchema,
} from "../../core/schemas/contract-profile.schema";
import { ContractProfileMockService } from "../../infra/mock/contract-profile.mock";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";

export async function getContractProfileAction(
    id: number
): Promise<Result<ContractProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetContractProfileSchema.safeParse({ id });
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ?? "Identificador do contrato inválido"
        );
    }

    return ContractProfileMockService.getProfileById(parsed.data.id);
}
