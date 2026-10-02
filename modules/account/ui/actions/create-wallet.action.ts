"use server";

import { CreateWalletSchema, CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";
import { failure, success, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

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

    try {
        const wallet = await prisma.balance.create({
            data: {
                contextId: session.contextId,
                name: parsed.data.name,
                balanceType: "WALLET",
            },
        });

        revalidatePath("/(private)/(wallets)");

        return success({
            id: wallet.id,
            name: wallet.name,
        });
    } catch (error) {
        console.error("[createWalletAction] Falha ao criar carteira:", error);
        return failure("Erro ao salvar carteira no banco de dados.");
    }
}
