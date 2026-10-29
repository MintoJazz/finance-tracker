"use server"

import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { failure } from "@/types/result.types";

interface GetWalletsActionDTO {
    pageRequest: PageRequest;
    filter?: BaseFilter;
}


export async function getWalletsAction({ pageRequest, filter }: GetWalletsActionDTO) {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = WalletFactory.makeGetContextWalletsUseCase();
    return await useCase.execute({ session, pageRequest, filter });
}
