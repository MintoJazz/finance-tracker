"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { failure } from "@/types/result.types";

export async function getWalletByIdAction(walletId: number) {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const useCase = WalletFactory.makeGetWalletByIdUseCase();
    return await useCase.execute({ session, walletId });
}
