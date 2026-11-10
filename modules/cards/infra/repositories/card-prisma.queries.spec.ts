import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CardPrismaQueries } from "./card-prisma.queries";
import { prisma } from "@/lib/prisma";

describe("CardPrismaQueries - Agregação de Limite Usado no Banco", () => {
    const cardQueries = new CardPrismaQueries();

    it("retorna Map vazio se array de balanceIds estiver vazio", async () => {
        const result = await cardQueries.sumAmountsByBalance([]);
        assert.equal(result.size, 0);
    });

    it("retorna 0 para balanceIds inexistentes ou sem movimentos", async () => {
        const nonExistentId = 99999999;
        const result = await cardQueries.sumAmountsByBalance([nonExistentId]);
        assert.equal(result.get(nonExistentId), 0);
    });

    it("calcula corretamente limite usado em cartão real agregando no banco", async () => {
        // Busca um cartão real com compras no banco de dados populado
        const card = await prisma.balance.findFirst({
            where: {
                balanceType: "CREDIT",
                movements: { some: {} },
            },
            select: { id: true },
        });

        if (!card) {
            // Se não houver cartão com movimentos, o teste passa trivialmente
            return;
        }

        const result = await cardQueries.sumAmountsByBalance([card.id]);
        assert.ok(result.has(card.id));
        const usedLimit = result.get(card.id)!;
        assert.ok(usedLimit >= 0, "Limite usado deve ser sempre não negativo");

        // Valida contra soma manual direta do banco
        const manualMovements = await prisma.movement.findMany({
            where: {
                balanceId: card.id,
                entry: { reversedBy: null, reversesEntryId: null },
            },
            select: { amount: true },
        });
        const manualSum = manualMovements.reduce((acc, m) => acc + m.amount, 0);
        const expectedUsed = Math.max(0, -manualSum);

        assert.equal(usedLimit, expectedUsed);
    });
});

