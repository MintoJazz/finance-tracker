import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { MovementDirection, Prisma } from "@/prisma/generated/prisma/client";

/**
 * `vw_entry_category`: `credit_settlement` (pagamento de fatura) só vale para a perna do cartão
 * que REDUZ a dívida (amount > 0). Cada caso roda numa transação que SEMPRE sofre rollback.
 */

class Rollback extends Error {}

async function inRollback(fn: (tx: Prisma.TransactionClient) => Promise<void>) {
    try {
        await prisma.$transaction(
            async (tx) => {
                await fn(tx);
                throw new Rollback();
            },
            { timeout: 30_000 }
        );
    } catch (error) {
        if (!(error instanceof Rollback)) throw error;
    }
}

type Leg = { balanceId: number; amount: number; direction: MovementDirection };
const debit = (balanceId: number, amount: number): Leg => ({
    balanceId,
    amount: -Math.abs(amount),
    direction: "DEBIT",
});
const credit = (balanceId: number, amount: number): Leg => ({
    balanceId,
    amount: Math.abs(amount),
    direction: "CREDIT",
});

const DATE = new Date("2026-11-20T12:00:00.000Z");

async function setup(tx: Prisma.TransactionClient) {
    const context = await tx.financialContext.create({ data: { name: "spec-entry-category" } });
    const card = await tx.balance.create({
        data: {
            contextId: context.id,
            name: "Cartão",
            balanceType: "CREDIT",
            agreement: {
                create: {
                    isActive: true,
                    frequency: "MONTHLY",
                    interval: 1,
                    startsAt: new Date("2026-01-01"),
                    rules: {
                        create: { effectiveFrom: new Date("2026-01-01"), dueDay: 5, closingDay: 28 },
                    },
                },
            },
        },
    });
    const wallet = await tx.balance.create({
        data: { contextId: context.id, name: "Carteira", balanceType: "WALLET" },
    });

    const settle = (legs: Leg[]) =>
        tx.entry.create({
            data: {
                description: "spec settlement",
                type: "SETTLEMENT",
                dueDate: DATE,
                competanceDate: DATE,
                movements: { create: legs },
            },
        });

    const kindOf = async (entryId: number) => {
        const rows = await tx.$queryRaw<{ kind: string; creditBalanceId: number | null }[]>(
            Prisma.sql`SELECT kind, "creditBalanceId" FROM vw_entry_category WHERE "entryId" = ${entryId}`
        );
        assert.equal(rows.length, 1);
        return rows[0];
    };

    return { card: card.id, wallet: wallet.id, settle, kindOf };
}

describe("vw_entry_category - credit_settlement por sentido da perna", () => {
    after(async () => {
        await prisma.$disconnect();
    });

    it("pagamento da fatura (cartão +) é credit-settlement", () =>
        inRollback(async (tx) => {
            const { card, wallet, settle, kindOf } = await setup(tx);
            const entry = await settle([debit(wallet, 100), credit(card, 100)]);
            const row = await kindOf(entry.id);
            assert.equal(row.kind, "credit-settlement");
            assert.equal(row.creditBalanceId, card);
        }));

    it("liquidação que aumenta a dívida do cartão (cartão −) não é credit-settlement", () =>
        inRollback(async (tx) => {
            const { card, wallet, settle, kindOf } = await setup(tx);
            const entry = await settle([debit(card, 50), credit(wallet, 50)]);
            const row = await kindOf(entry.id);
            assert.notEqual(row.kind, "credit-settlement");
        }));
});

describe("vw_entry_category - parcelamento como obrigação", () => {
    after(async () => {
        await prisma.$disconnect();
    });

    async function setupInstallment(tx: Prisma.TransactionClient) {
        const context = await tx.financialContext.create({ data: { name: "spec-entry-category-inst" } });
        const category = await tx.balance.create({
            data: { contextId: context.id, name: "Subcategoria", balanceType: "CATEGORY" },
        });
        const wallet = await tx.balance.create({
            data: { contextId: context.id, name: "Carteira", balanceType: "WALLET" },
        });
        const card = await tx.balance.create({
            data: { contextId: context.id, name: "Cartão", balanceType: "CREDIT" },
        });
        const installment = await tx.balance.create({
            data: {
                contextId: context.id,
                name: "Parcelamento",
                balanceType: "INSTALLMENT",
                parentId: category.id,
                agreement: {
                    create: {
                        isActive: true,
                        frequency: "MONTHLY",
                        interval: 1,
                        startsAt: new Date("2030-11-01"),
                        rules: { create: { effectiveFrom: new Date("2030-11-01"), dueDay: 15 } },
                    },
                },
            },
        });

        const entry = (type: "ACCRUAL" | "TRANSFER" | "SETTLEMENT", date: Date, legs: Leg[]) =>
            tx.entry.create({
                data: {
                    description: `spec ${type}`,
                    type,
                    dueDate: date,
                    competanceDate: date,
                    movements: { create: legs },
                },
            });

        const kindOf = async (entryId: number) => {
            const rows = await tx.$queryRaw<{ kind: string; categoryBalanceId: number | null }[]>(
                Prisma.sql`SELECT kind, "categoryBalanceId" FROM vw_entry_category WHERE "entryId" = ${entryId}`
            );
            assert.equal(rows.length, 1);
            return rows[0];
        };

        return { category: category.id, wallet: wallet.id, card: card.id, installment: installment.id, entry, kindOf };
    }

    const NOV = new Date("2030-11-15T12:00:00.000Z");
    const DEC = new Date("2030-12-15T12:00:00.000Z");

    it("ACCRUAL da parcela é classificado pela perna de categoria", () =>
        inRollback(async (tx) => {
            const s = await setupInstallment(tx);
            const accrual = await s.entry("ACCRUAL", NOV, [debit(s.installment, 50), credit(s.category, 50)]);
            const row = await s.kindOf(accrual.id);
            assert.equal(row.kind, "category");
            assert.equal(row.categoryBalanceId, s.category);
        }));

    it("liquidação na mesma competência da provisão herda a categoria dela", () =>
        inRollback(async (tx) => {
            const s = await setupInstallment(tx);
            await s.entry("ACCRUAL", NOV, [debit(s.installment, 50), credit(s.category, 50)]);
            const settlement = await s.entry("SETTLEMENT", NOV, [
                debit(s.wallet, 50),
                credit(s.installment, 50),
            ]);
            const row = await s.kindOf(settlement.id);
            assert.equal(row.kind, "category");
            assert.equal(row.categoryBalanceId, s.category);
        }));

    it("liquidação em outra competência herda a categoria pelo parentId do parcelamento", () =>
        inRollback(async (tx) => {
            const s = await setupInstallment(tx);
            await s.entry("ACCRUAL", NOV, [debit(s.installment, 50), credit(s.category, 50)]);
            const settlement = await s.entry("SETTLEMENT", DEC, [
                debit(s.wallet, 50),
                credit(s.installment, 50),
            ]);
            const row = await s.kindOf(settlement.id);
            assert.equal(row.kind, "category");
            assert.equal(row.categoryBalanceId, s.category);
        }));

    it("TRANSFER da dívida ao cartão (sem perna de categoria) não tem categoria própria", () =>
        inRollback(async (tx) => {
            const s = await setupInstallment(tx);
            const transfer = await s.entry("TRANSFER", NOV, [
                credit(s.installment, 50),
                debit(s.card, 50),
            ]);
            const row = await s.kindOf(transfer.id);
            assert.notEqual(row.kind, "credit-settlement");
        }));
});

