import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { MovementDirection, Prisma } from "@/prisma/generated/prisma/client";

/**
 * `vw_installment_summary` no modelo "parcelamento como obrigação" (sem FK no Entry):
 * - parcela = ACCRUAL no Balance INSTALLMENT; em fatura, um TRANSFER passa a dívida ao cartão;
 * - fatura paga = saldo da janela do cartão <= 0 (soma com sinal dos Movements);
 * - mês a mês paga = SETTLEMENT redutor no parcelamento com a mesma referência.
 * Datas em 2030 para não depender do relógio. Cada caso roda numa transação que SEMPRE sofre rollback.
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

const at = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12));
const NOV = at(2030, 11, 15);
const DEC = at(2030, 12, 15);
const JAN = at(2031, 1, 15);

async function setup(tx: Prisma.TransactionClient) {
    const context = await tx.financialContext.create({ data: { name: "spec-installments" } });
    const balance = (
        name: string,
        balanceType: "INSTALLMENT" | "CREDIT" | "CATEGORY" | "WALLET",
        extra: Partial<Prisma.BalanceUncheckedCreateInput> = {}
    ) =>
        tx.balance
            .create({ data: { contextId: context.id, name, balanceType, ...extra } })
            .then((b) => b.id);

    const category = await balance("Subcategoria", "CATEGORY");
    const wallet = await balance("Carteira", "WALLET");
    const card = await tx.balance
        .create({
            data: {
                contextId: context.id,
                name: "Cartão",
                balanceType: "CREDIT",
                agreement: {
                    create: {
                        isActive: true,
                        frequency: "MONTHLY",
                        interval: 1,
                        startsAt: new Date("2020-01-01"),
                        rules: {
                            create: {
                                effectiveFrom: new Date("2020-01-01"),
                                dueDay: 5,
                                closingDay: 28,
                            },
                        },
                    },
                },
            },
        })
        .then((b) => b.id);
    const installment = await balance("Parcelamento", "INSTALLMENT", { parentId: category });

    const entry = (
        type: "ACCRUAL" | "TRANSFER" | "SETTLEMENT" | "CLAIM_PAYMENT" | "DIRECT" | "REVERSAL",
        date: Date,
        legs: Leg[],
        extra: { reversesEntryId?: number } = {}
    ) =>
        tx.entry.create({
            data: {
                description: `spec ${type}`,
                type,
                dueDate: date,
                competanceDate: date,
                reversesEntryId: extra.reversesEntryId ?? null,
                movements: { create: legs },
            },
        });

    /** Parcela: provisão no parcelamento; em fatura, a dívida passa ao cartão. */
    const parcela = async (
        amount: number,
        date: Date,
        invoice: boolean,
        overrideCardId?: number
    ) => {
        const accrual = await entry("ACCRUAL", date, [
            debit(installment, amount),
            credit(category, amount),
        ]);
        let transfer: Awaited<ReturnType<typeof entry>> | null = null;
        if (invoice) {
            const targetCard = overrideCardId ?? card;
            transfer = await entry("TRANSFER", date, [
                credit(installment, amount),
                debit(targetCard, amount),
            ]);
        }
        return { accrual, transfer };
    };

    const summary = async () => {
        const rows = await tx.$queryRaw<
            {
                totalInstallments: number;
                paidInstallments: number;
                paidAmount: number;
                consolidatedInstallments: number;
                consolidatedAmount: number;
                installmentAmount: number;
                totalAmount: number;
                firstDueDate: Date | null;
                nextDueDate: Date | null;
                endsAt: Date | null;
                isOverdue: boolean;
                cardBalanceId: number | null;
                categoryBalanceId: number | null;
                removedAt: Date | null;
            }[]
        >(
            Prisma.sql`SELECT "totalInstallments", "paidInstallments", "paidAmount",
                              "consolidatedInstallments", "consolidatedAmount",
                              "installmentAmount", "totalAmount",
                              "firstDueDate", "nextDueDate", "endsAt", "isOverdue",
                              "cardBalanceId", "categoryBalanceId", "removedAt"
                       FROM vw_installment_summary WHERE "balanceId" = ${installment}`
        );
        assert.equal(rows.length, 1, "o parcelamento deve aparecer na view");
        return rows[0];
    };

    return { ids: { installment, card, category, wallet, context: context.id }, entry, parcela, summary };
}

const day = (d: Date) => d.toISOString().slice(0, 10);

describe("vw_installment_summary - mês a mês", () => {
    after(async () => {
        await prisma.$disconnect();
    });

    it("totais vêm das parcelas reais: a última absorve o resto e o tipo não tem cartão", () =>
        inRollback(async (tx) => {
            const { ids, parcela, summary } = await setup(tx);
            await parcela(33, NOV, false);
            await parcela(33, DEC, false);
            await parcela(34, JAN, false);

            const row = await summary();
            assert.equal(row.totalInstallments, 3);
            assert.equal(row.installmentAmount, 33);
            assert.equal(row.totalAmount, 100);
            assert.equal(row.paidInstallments, 0);
            assert.equal(row.cardBalanceId, null);
            assert.equal(row.categoryBalanceId, ids.category);
            assert.equal(day(row.nextDueDate as Date), "2030-11-15");
            assert.equal(day(row.endsAt as Date), "2031-01-15");
            assert.equal(row.isOverdue, false);
            assert.equal(row.paidAmount, 0);
            assert.equal(row.consolidatedInstallments, 0);
            assert.equal(row.consolidatedAmount, 0);
            assert.equal(row.removedAt, null);
        }));

    it("pagamento da carteira (perna que reduz o parcelamento) marca só a parcela da mesma referência", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(33, NOV, false);
            await parcela(33, DEC, false);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 33), credit(ids.installment, 33)]);

            const row = await summary();
            assert.equal(row.paidInstallments, 1);
            assert.equal(day(row.nextDueDate as Date), "2030-12-15");
        }));

    it("liquidação que AUMENTA o parcelamento não conta como pagamento", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(33, NOV, false);
            await entry("SETTLEMENT", NOV, [debit(ids.installment, 33), credit(ids.wallet, 33)]);

            assert.equal((await summary()).paidInstallments, 0);
        }));

    it("parcela vencida e não paga => isOverdue", () =>
        inRollback(async (tx) => {
            const { parcela, summary } = await setup(tx);
            await parcela(33, at(2020, 3, 10), false);

            assert.equal((await summary()).isOverdue, true);
        }));

    it("pagamento parcial no mês a mês não marca parcela como paga; complementar o valor quita", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, false);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 40), credit(ids.installment, 40)]);

            assert.equal((await summary()).paidInstallments, 0);

            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 60), credit(ids.installment, 60)]);
            assert.equal((await summary()).paidInstallments, 1);
        }));

    it("pagamento atrasado com dueDate em outro mês e competanceDate dentro da janela quita a parcela", () =>
        inRollback(async (tx) => {
            const { ids, parcela, summary } = await setup(tx);
            await parcela(100, NOV, false);

            await tx.entry.create({
                data: {
                    description: "pagamento atrasado",
                    type: "SETTLEMENT",
                    dueDate: at(2030, 12, 20),
                    competanceDate: at(2030, 11, 28),
                    movements: {
                        create: [debit(ids.wallet, 100), credit(ids.installment, 100)],
                    },
                },
            });

            assert.equal((await summary()).paidInstallments, 1);
        }));

    it("mês a mês com CycleRule deriva nextDueDate e endsAt da regra vigente sem mutar Entry.dueDate", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await tx.agreement.create({
                data: {
                    balanceId: ids.installment,
                    isActive: true,
                    frequency: "MONTHLY",
                    interval: 1,
                    startsAt: new Date("2030-11-01"),
                    endsAt: new Date("2031-01-31"),
                    rules: {
                        create: [
                            { effectiveFrom: new Date("2030-11-01"), dueDay: 15, closingDay: null },
                            { effectiveFrom: new Date("2030-12-01"), dueDay: 22, closingDay: null },
                        ],
                    },
                },
            });

            await parcela(100, NOV, false);
            await parcela(100, DEC, false);
            await parcela(100, JAN, false);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 100), credit(ids.installment, 100)]);

            const row = await summary();
            assert.equal(row.paidInstallments, 1);
            assert.equal(day(row.firstDueDate as Date), "2030-11-15");
            assert.equal(day(row.nextDueDate as Date), "2030-12-22");
            assert.equal(day(row.endsAt as Date), "2031-01-22");
        }));
});

describe("vw_installment_summary - fatura (TRANSFER para o cartão)", () => {
    it("tipo derivado do cartão; vencimento efetivo vem do ciclo do cartão", () =>
        inRollback(async (tx) => {
            const { ids, parcela, summary } = await setup(tx);
            // fecha dia 28, vence dia 5: compra de 15/nov cai na fatura que fecha em 28/nov e vence em 5/dez
            await parcela(100, NOV, true);
            await parcela(100, DEC, true);
            await parcela(100, JAN, true);

            const row = await summary();
            assert.equal(row.cardBalanceId, ids.card);
            assert.equal(row.totalInstallments, 3);
            assert.equal(row.totalAmount, 300);
            assert.equal(row.paidInstallments, 0);
            assert.equal(day(row.nextDueDate as Date), "2030-12-05");
            assert.equal(day(row.endsAt as Date), "2031-02-05");
        }));

    it("fatura paga por inteiro marca só as parcelas da janela dela", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, true);
            await parcela(100, DEC, true);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 100), credit(ids.card, 100)]);

            const row = await summary();
            assert.equal(row.paidInstallments, 1);
            assert.equal(day(row.nextDueDate as Date), "2031-01-05");
        }));

    it("pagamento parcial da fatura não marca a parcela como paga", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, true);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 40), credit(ids.card, 40)]);

            assert.equal((await summary()).paidInstallments, 0);
        }));

    it("outras compras na mesma fatura entram no saldo: só quitar tudo paga a parcela", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, true);
            await entry("DIRECT", NOV, [debit(ids.card, 50), credit(ids.category, 50)]);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 100), credit(ids.card, 100)]);
            assert.equal((await summary()).paidInstallments, 0);

            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 50), credit(ids.card, 50)]);
            assert.equal((await summary()).paidInstallments, 1);
        }));

    it("pagamento em outra janela do cartão não afeta a parcela", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, true);
            // competência em janeiro: pertence à fatura que fecha em 28/jan
            await entry("SETTLEMENT", JAN, [debit(ids.wallet, 100), credit(ids.card, 100)]);

            assert.equal((await summary()).paidInstallments, 0);
        }));

    it("cobrança que AUMENTA a dívida do cartão nunca conta como pagamento", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, true);
            await entry("SETTLEMENT", NOV, [debit(ids.card, 50), credit(ids.wallet, 50)]);

            assert.equal((await summary()).paidInstallments, 0);
        }));

    it("compra depois do fechamento cai na fatura seguinte", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            // 29/nov passa do fechamento (28): entra na fatura que fecha em 28/dez (janela 29/nov a 28/dez)
            await parcela(100, at(2030, 11, 29), true);
            // pagar a janela anterior (29/out a 28/nov) não paga a parcela
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 100), credit(ids.card, 100)]);
            assert.equal((await summary()).paidInstallments, 0);

            await entry("SETTLEMENT", DEC, [debit(ids.wallet, 100), credit(ids.card, 100)]);
            assert.equal((await summary()).paidInstallments, 1);
        }));

    it("fatura fechada e ainda não paga conta como consolidada mas não como paga", () =>
        inRollback(async (tx) => {
            const { parcela, summary } = await setup(tx);
            // Março/2020 já fechou há muito tempo (winTo < CURRENT_DATE), sem pagamento
            await parcela(100, at(2020, 3, 15), true);
            await parcela(100, NOV, true);

            const row = await summary();
            assert.equal(row.totalInstallments, 2);
            assert.equal(row.paidInstallments, 0);
            assert.equal(row.paidAmount, 0);
            assert.equal(row.consolidatedInstallments, 1);
            assert.equal(row.consolidatedAmount, 100);
            assert.equal(row.isOverdue, true);
        }));

    it("installmentAmount reflete a primeira parcela em aberto após reestruturação (e última quando 100% consolidado)", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            await parcela(100, NOV, false);
            await parcela(150, DEC, false);
            await parcela(155, JAN, false);
            // paga 1ª parcela via CLAIM_PAYMENT
            await entry("CLAIM_PAYMENT", NOV, [debit(ids.wallet, 100), credit(ids.installment, 100)]);

            const partial = await summary();
            assert.equal(partial.paidInstallments, 1);
            assert.equal(partial.paidAmount, 100);
            assert.equal(partial.consolidatedInstallments, 1);
            assert.equal(partial.consolidatedAmount, 100);
            assert.equal(partial.installmentAmount, 150);
            assert.equal(partial.totalAmount, 405);

            // paga todas as demais: fallback para a última parcela
            await entry("SETTLEMENT", DEC, [debit(ids.wallet, 150), credit(ids.installment, 150)]);
            await entry("SETTLEMENT", JAN, [debit(ids.wallet, 155), credit(ids.installment, 155)]);

            const settled = await summary();
            assert.equal(settled.paidInstallments, 3);
            assert.equal(settled.paidAmount, 405);
            assert.equal(settled.consolidatedInstallments, 3);
            assert.equal(settled.consolidatedAmount, 405);
            assert.equal(settled.installmentAmount, 155);
        }));

    it("cardBalanceId reflete o cartão da cauda em aberto após troca de cartão", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            const newCard = await tx.balance.create({
                data: {
                    contextId: ids.context,
                    name: "Cartão Novo",
                    balanceType: "CREDIT",
                    agreement: {
                        create: {
                            isActive: true,
                            frequency: "MONTHLY",
                            interval: 1,
                            startsAt: new Date("2020-01-01"),
                            rules: {
                                create: {
                                    effectiveFrom: new Date("2020-01-01"),
                                    dueDay: 10,
                                    closingDay: 28,
                                },
                            },
                        },
                    },
                },
            });

            // 1ª parcela consolidada (paga) no cartão antigo (ID menor)
            await parcela(100, NOV, true, ids.card);
            await entry("SETTLEMENT", NOV, [debit(ids.wallet, 100), credit(ids.card, 100)]);
            // 2ª parcela em aberto no cartão novo (ID maior)
            await parcela(100, DEC, true, newCard.id);

            const row = await summary();
            assert.equal(row.consolidatedInstallments, 1);
            assert.equal(row.cardBalanceId, newCard.id);
        }));

    it("estorno (REVERSAL) exclui parcela da contagem e dos totais; arquivado sem parcelas retorna datas nulas", () =>
        inRollback(async (tx) => {
            const { ids, entry, parcela, summary } = await setup(tx);
            const { accrual } = await parcela(100, NOV, false);
            await entry(
                "REVERSAL",
                NOV,
                [credit(ids.installment, 100), debit(ids.category, 100)],
                { reversesEntryId: accrual.id }
            );
            await tx.balance.update({
                where: { id: ids.installment },
                data: { removedAt: new Date() },
            });

            const row = await summary();
            assert.equal(row.totalInstallments, 0);
            assert.equal(row.paidInstallments, 0);
            assert.equal(row.paidAmount, 0);
            assert.equal(row.consolidatedInstallments, 0);
            assert.equal(row.consolidatedAmount, 0);
            assert.equal(row.totalAmount, 0);
            assert.equal(row.installmentAmount, 0);
            assert.equal(row.firstDueDate, null);
            assert.equal(row.nextDueDate, null);
            assert.equal(row.endsAt, null);
            assert.ok(row.removedAt != null);
        }));

    it("cartão com dueDay = 31 faz clamp em fevereiro (28/02) sem transbordar para março", () =>
        inRollback(async (tx) => {
            const { ids, parcela, summary } = await setup(tx);
            const card31 = await tx.balance.create({
                data: {
                    contextId: ids.context,
                    name: "Cartão Dia 31",
                    balanceType: "CREDIT",
                    agreement: {
                        create: {
                            isActive: true,
                            frequency: "MONTHLY",
                            interval: 1,
                            startsAt: new Date("2020-01-01"),
                            rules: {
                                create: {
                                    effectiveFrom: new Date("2020-01-01"),
                                    dueDay: 31,
                                    closingDay: 20,
                                },
                            },
                        },
                    },
                },
            });

            // Compra em 10/fev/2031 (antes do fechamento dia 20): fatura fecha em 20/fev e vence em 28/fev (clamp de 31)
            await parcela(100, at(2031, 2, 10), true, card31.id);

            const row = await summary();
            assert.equal(day(row.nextDueDate as Date), "2031-02-28");
            assert.equal(day(row.endsAt as Date), "2031-02-28");
        }));
});
