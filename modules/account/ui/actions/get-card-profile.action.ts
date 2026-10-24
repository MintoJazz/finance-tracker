"use server";

import { failure, Result } from "@/types/result.types";
import {
    CardProfile,
    GetCardProfileSchema,
} from "../../core/schemas/card-profile.schema";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { AccountFactory } from "../../infra/factories/account.factory";

export async function getCardProfileAction(
    id: number
): Promise<Result<CardProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetCardProfileSchema.safeParse({ id });
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ?? "Identificador do cartão inválido"
        );
    }

    const useCase = AccountFactory.makeGetCardProfileUseCase();
    return await useCase.execute({
        session,
        cardId: parsed.data.id,
    });
}