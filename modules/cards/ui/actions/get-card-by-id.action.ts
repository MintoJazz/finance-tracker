"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { failure } from "@/types/result.types";

export async function getCardByIdAction(cardId: number) {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = CardFactory.makeGetCardByIdUseCase();
    return await useCase.execute({ session, cardId });
}
