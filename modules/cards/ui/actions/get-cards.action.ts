"use server";

import { PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { failure } from "@/types/result.types";

interface GetCardsActionDTO {
    pageRequest: PageRequest;
    filter?: BaseFilter;
}

export async function getCardsAction({ pageRequest, filter }: GetCardsActionDTO) {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = CardFactory.makeGetContextCardsUseCase();
    return await useCase.execute({ session, pageRequest, filter });
}
