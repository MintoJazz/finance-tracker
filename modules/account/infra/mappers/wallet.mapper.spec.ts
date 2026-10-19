import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WalletMapper, BalanceWithLatestActivity } from "./wallet.mapper";
import { Balance as PrismaBalance } from "@/prisma/generated/prisma/client";

describe("WalletMapper", () => {
    describe("toSummary", () => {
        it("should correctly map an active wallet with latest activity date", () => {
            const dueDate = new Date("2026-03-10T12:00:00Z");
            const balance: BalanceWithLatestActivity = {
                id: 1,
                parentId: null,
                contextId: 10,
                name: "Carteira Ativa",
                balanceType: "WALLET",
                createdAt: new Date("2026-01-01"),
                updatedAt: new Date("2026-01-01"),
                removedAt: null,
                movements: [
                    {
                        entry: {
                            dueDate,
                        },
                    },
                ],
            };

            const summary = WalletMapper.toSummary(balance, 125000);

            assert.equal(summary.id, 1);
            assert.equal(summary.name, "Carteira Ativa");
            assert.equal(summary.amount, 125000);
            assert.equal(summary.isArchived, false);
            assert.equal(summary.lastActivityAt, dueDate);
        });

        it("should map an archived wallet without movements", () => {
            const balance: BalanceWithLatestActivity = {
                id: 2,
                parentId: null,
                contextId: 10,
                name: "Carteira Antiga",
                balanceType: "WALLET",
                createdAt: new Date("2026-01-01"),
                updatedAt: new Date("2026-01-01"),
                removedAt: new Date("2026-02-01"),
                movements: [],
            };

            const summary = WalletMapper.toSummary(balance, 0);

            assert.equal(summary.id, 2);
            assert.equal(summary.name, "Carteira Antiga");
            assert.equal(summary.amount, 0);
            assert.equal(summary.isArchived, true);
            assert.equal(summary.lastActivityAt, null);
        });
    });

    describe("toProfile", () => {
        it("should correctly map wallet profile data", () => {
            const createdAt = new Date("2026-01-15T08:00:00Z");
            const balance: PrismaBalance = {
                id: 3,
                parentId: null,
                contextId: 10,
                name: "Carteira de Investimentos",
                balanceType: "WALLET",
                createdAt,
                updatedAt: new Date("2026-01-15"),
                removedAt: null,
            };

            const profile = WalletMapper.toProfile(balance, 500000);

            assert.equal(profile.id, 3);
            assert.equal(profile.name, "Carteira de Investimentos");
            assert.equal(profile.currentBalance, 500000);
            assert.equal(profile.isArchived, false);
            assert.equal(profile.createdAt, createdAt);
        });
    });
});
