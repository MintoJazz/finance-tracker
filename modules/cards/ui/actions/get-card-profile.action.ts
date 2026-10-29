"use server";

import { failure, Result } from "@/types/result.types";
import {
    CardProfile,
    GetCardProfileSchema,
} from "../../models/card-profile.schema";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";

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

    const useCase = CardFactory.makeGetCardProfileUseCase();
    return await useCase.execute({
        session,
        cardId: parsed.data.id,
    });
}