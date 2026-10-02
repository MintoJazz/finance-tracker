"use server";

import { UpdateWalletSchema, UpdateWalletInput } from "@/modules/account/core/schemas/wallet.schema";
import { failure, success, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface UpdateWalletActionResult {
    id: number;
    name: string;
}

export async function updateWalletAction(
    input: UpdateWalletInput
): Promise<Result<UpdateWalletActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = UpdateWalletSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    try {
        const existing = await prisma.balance.findFirst({
            where: {
                id: parsed.data.id,
                contextId: session.contextId,
                balanceType: "WALLET",
            },
        });

        if (!existing) {
            return failure("Carteira não encontrada.");
        }

        const updated = await prisma.balance.update({
            where: {
                id: parsed.data.id,
            },
            data: {
                name: parsed.data.name,
            },
        });

        revalidatePath("/(private)/(wallets)");

        return success({
            id: updated.id,
            name: updated.name,
        });
    } catch (error) {
        console.error("[updateWalletAction] Falha ao atualizar carteira:", error);
        return failure("Erro ao atualizar carteira no banco de dados.");
    }
}
