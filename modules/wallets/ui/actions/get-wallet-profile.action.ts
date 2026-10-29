"use server";

import { failure, Result } from "@/types/result.types";
import { WalletProfile } from "../../models/wallet-profile.schema";
import { GetWalletProfileSchema } from "../../models/wallet-profile.schema";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";

export async function getWalletProfileAction(id: number): Promise<Result<WalletProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetWalletProfileSchema.safeParse({ id });
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Identificador da carteira inválido");
    }

    const useCase = WalletFactory.makeGetWalletProfileUseCase();
    return await useCase.execute({
        session,
        walletId: parsed.data.id,
    });
}