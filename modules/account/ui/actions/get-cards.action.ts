"use server";

import { PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { AccountFactory } from "@/modules/account/infra/factories/account.factory";
import { failure } from "@/types/result.types";

interface GetCardsActionDTO {
    pageRequest: PageRequest;
    filter?: BaseFilter;
}

export async function getCardsAction({ pageRequest, filter }: GetCardsActionDTO) {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = AccountFactory.makeGetContextCardsUseCase();
    return await useCase.execute({ session, pageRequest, filter });
}
