"use server";

import { CreateWalletSchema, CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { AccountFactory } from "@/modules/account/infra/factories/account.factory";
import { revalidatePath } from "next/cache";

export interface CreateWalletActionResult {
    id: number;
    name: string;
}

export async function createWalletAction(
    formData: CreateWalletFormValues
): Promise<Result<CreateWalletActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = CreateWalletSchema.safeParse(formData);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const useCase = AccountFactory.makeCreateWalletUseCase();
    const result = await useCase.execute({ session, data: parsed.data });

    if (result.success) revalidatePath("/wallets", "layout");

    return result;
}
