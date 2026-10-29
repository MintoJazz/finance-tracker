"use server";

import { ArchiveWalletSchema, ArchiveWalletInput } from "@/modules/wallets/models/wallet.schema";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { revalidatePath } from "next/cache";

export interface ArchiveWalletActionResult {
    id: number;
    name: string;
}

export async function archiveWalletAction(
    input: ArchiveWalletInput
): Promise<Result<ArchiveWalletActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = ArchiveWalletSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const useCase = WalletFactory.makeArchiveWalletUseCase();
    const result = await useCase.execute({ session, data: parsed.data });

    if (result.success) {
        revalidatePath("/wallets", "layout");
    }

    return result;
}
