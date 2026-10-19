import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CardMapper, BalanceWithCreditDetails } from "./card.mapper";

describe("CardMapper", () => {
    it("should calculate limit by summing all deltas in agreement.amountEntries", () => {
        const balance: BalanceWithCreditDetails = {
            id: 1,
            parentId: null,
            contextId: 10,
            name: "Cartão Black",
            balanceType: "CREDIT",
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-01"),
            removedAt: null,
            agreement: {
                id: 100,
                balanceId: 1,
                includeInProjection: true,
                startsAt: new Date("2026-01-01"),
                endsAt: null,
                createdAt: new Date("2026-01-01"),
                updatedAt: new Date("2026-01-01"),
                rules: [
                    {
                        id: 50,
                        agreementId: 100,
                        effectiveFrom: new Date("2026-01-01"),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: 25,
                        dueDay: 5,
                        createdAt: new Date("2026-01-01"),
                    },
                ],
                amountEntries: [
                    {
                        id: 1,
                        agreementId: 100,
                        amount: 500000, // Limite inicial: R$ 5.000,00
                        effectiveAt: new Date("2026-01-01"),
                        reason: "Limite inicial",
                        createdAt: new Date("2026-01-01"),
                    },
                    {
                        id: 2,
                        agreementId: 100,
                        amount: 200000, // Aumento de R$ 2.000,00
                        effectiveAt: new Date("2026-02-01"),
                        reason: "Ajuste de limite",
                        createdAt: new Date("2026-02-01"),
                    },
                    {
                        id: 3,
                        agreementId: 100,
                        amount: -100000, // Redução de R$ 1.000,00
                        effectiveAt: new Date("2026-03-01"),
                        reason: "Redução solicitada",
                        createdAt: new Date("2026-03-01"),
                    },
                ],
            },
            movements: [],
        };

        const summary = CardMapper.toSummary(balance, 150000); // Usado: R$ 1.500,00

        // 500000 + 200000 - 100000 = 600000 (R$ 6.000,00)
        assert.equal(summary.limit, 600000);
        assert.equal(summary.usedLimit, 150000);
        // Disponível: 600000 - 150000 = 450000 (R$ 4.500,00)
        assert.equal(summary.availableLimit, 450000);
        assert.equal(summary.closingDay, 25);
        assert.equal(summary.dueDay, 5);
        assert.equal(summary.isArchived, false);
    });

    it("should handle balance with no amountEntries as 0 limit", () => {
        const balance: BalanceWithCreditDetails = {
            id: 2,
            parentId: null,
            contextId: 10,
            name: "Cartão Sem Limite",
            balanceType: "CREDIT",
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-01"),
            removedAt: null,
            agreement: {
                id: 101,
                balanceId: 2,
                includeInProjection: true,
                startsAt: new Date("2026-01-01"),
                endsAt: null,
                createdAt: new Date("2026-01-01"),
                updatedAt: new Date("2026-01-01"),
                rules: [],
                amountEntries: [],
            },
        };

        const summary = CardMapper.toSummary(balance, 50000);
        assert.equal(summary.limit, 0);
        assert.equal(summary.availableLimit, 0);
    });

    it("should clamp limit and availableLimit to 0 if deltas sum to negative", () => {
        const balance: BalanceWithCreditDetails = {
            id: 3,
            parentId: null,
            contextId: 10,
            name: "Cartão Delta Negativo",
            balanceType: "CREDIT",
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-01"),
            removedAt: null,
            agreement: {
                id: 102,
                balanceId: 3,
                includeInProjection: true,
                startsAt: new Date("2026-01-01"),
                endsAt: null,
                createdAt: new Date("2026-01-01"),
                updatedAt: new Date("2026-01-01"),
                rules: [],
                amountEntries: [
                    {
                        id: 1,
                        agreementId: 102,
                        amount: -50000,
                        effectiveAt: new Date("2026-01-01"),
                        reason: "Delta negativo anômalo",
                        createdAt: new Date("2026-01-01"),
                    },
                ],
            },
        };

        const summary = CardMapper.toSummary(balance, 0);
        assert.equal(summary.limit, 0);
        assert.equal(summary.availableLimit, 0);
    });
});
