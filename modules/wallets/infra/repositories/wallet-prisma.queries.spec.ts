import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WalletPrismaQueries } from "./wallet-prisma.queries";
import { prisma } from "@/lib/prisma";

describe("WalletPrismaQueries - Agregação de Saldo no Banco", () => {
    const walletQueries = new WalletPrismaQueries();

    it("retorna Map vazio se array de balanceIds estiver vazio", async () => {
        const result = await walletQueries.sumAmountsByBalance([]);
        assert.equal(result.size, 0);
    });

    it("retorna 0 para balanceIds inexistentes ou sem movimentos", async () => {
        const nonExistentId = 99999999;
        const result = await walletQueries.sumAmountsByBalance([nonExistentId]);
        assert.equal(result.get(nonExistentId), 0);
    });

    it("calcula corretamente saldo da carteira agregando no banco", async () => {
        // Busca uma carteira real com movimentos
        const wallet = await prisma.balance.findFirst({
            where: {
                balanceType: "WALLET",
                movements: { some: {} },
            },
            select: { id: true },
        });

        if (!wallet) {
            return;
        }

        const result = await walletQueries.sumAmountsByBalance([wallet.id]);
        assert.ok(result.has(wallet.id));
        const currentBalance = result.get(wallet.id)!;

        // Valida contra soma manual direta do banco
        const manualMovements = await prisma.movement.findMany({
            where: {
                balanceId: wallet.id,
                entry: { reversedBy: null, reversesEntryId: null },
            },
            select: { amount: true },
        });
        const expectedBalance = manualMovements.reduce((acc, m) => acc + m.amount, 0);

        assert.equal(currentBalance, expectedBalance);
    });
});

