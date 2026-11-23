import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import {
    BalanceType,
    EntryType,
    MovementDirection,
    Prisma,
    PrismaClient,
} from "@/prisma/generated/prisma/client";
import type { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";
import type { CycleWindowBoundaries } from "@/modules/cycles/application/services/cycle-window.engine";
import { CyclePrismaQueries } from "./cycle-prisma.queries";

/**
 * Integração do `aggregateCycles` (motor de ciclos).
 *
 * Cada caso roda numa transação que SEMPRE sofre rollback: nada é gravado no banco.
 * Semântica verificada (m' = amount * polaridade; m' > 0 aumenta o saldo, m' < 0 reduz):
 * - recognized: tipos que criam saldo + pernas m' > 0 de liquidação/transferência;
 * - paid: pernas m' < 0 de liquidação; transferred: pernas m' < 0 de transferência;
 * - remaining: soma com sinal de tudo (independe do tipo).
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

const NOV_15 = new Date("2026-11-15T12:00:00.000Z");
const TODAY = new Date("2026-11-21T12:00:00.000Z");

function window(
    from: [number, number, number],
    to: [number, number, number],
    due: [number, number, number]
): CycleWindowBoundaries {
    const d = ([y, m, day]: [number, number, number]) => new Date(y, m - 1, day);
    const iso = ([y, m, day]: [number, number, number]) =>
        `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return {
        range: { from: iso(from), to: iso(to) },
        beginsAt: d(from),
        endsAt: d(to),
        closingDate: d(to),
        dueDate: d(due),
        label: "spec",
        rule: {
            id: 0,
            agreementId: 0,
            dueDay: due[2],
            dueMonth: null,
            closingDay: to[2],
            closingMonth: null,
            effectiveFrom: d(from),
        },
        isBridgeCycle: false,
    };
}

const NOVEMBER = window([2026, 11, 1], [2026, 11, 30], [2026, 12, 5]);
const DECEMBER = window([2026, 12, 1], [2026, 12, 31], [2027, 1, 5]);

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

async function setup(tx: Prisma.TransactionClient) {
    const context = await tx.financialContext.create({ data: { name: "spec-cycles" } });
    const balance = (name: string, balanceType: BalanceType) =>
        tx.balance
            .create({ data: { contextId: context.id, name, balanceType } })
            .then((b) => b.id);

    const ids = {
        payable: await balance("Obrigação", "PAYABLE"),
        receivable: await balance("Direito", "RECEIVABLE"),
        card: await balance("Cartão", "CREDIT"),
        wallet: await balance("Carteira", "WALLET"),
        category: await balance("Categoria", "CATEGORY"),
        installment: await balance("Parcelamento", "INSTALLMENT"),
    };

    const entry = (type: EntryType, legs: Leg[], competanceDate = NOV_15) =>
        tx.entry.create({
            data: {
                description: `spec ${type}`,
                type,
                dueDate: competanceDate,
                competanceDate,
                movements: { create: legs },
            },
        });

    const queries = new CyclePrismaQueries(tx as unknown as PrismaClient);
    const filtered = (
        balanceId: number,
        balanceType: BalanceType,
        statuses: CycleStatus[]
    ) =>
        queries.aggregateCycles({
            balanceId,
            balanceType,
            windows: [NOVEMBER],
            today: TODAY,
            isOnce: false,
            statuses,
        });

    const cycle = async (
        balanceId: number,
        balanceType: BalanceType,
        win: CycleWindowBoundaries = NOVEMBER
    ) => {
        const [row] = await queries.aggregateCycles({
            balanceId,
            balanceType,
            windows: [win],
            today: TODAY,
            isOnce: false,
        });
        assert.ok(row, "o ciclo deve existir");
        return row;
    };

    return { ids, entry, cycle, filtered };
}

describe("CyclePrismaQueries.aggregateCycles - semântica por sinal", () => {
    after(async () => {
        await prisma.$disconnect();
    });

    it("obrigação quitada: provisão 100 + liquidação 100 => PAID", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("ACCRUAL", [debit(ids.payable, 100), credit(ids.category, 100)]);
            await entry("SETTLEMENT", [debit(ids.wallet, 100), credit(ids.payable, 100)]);

            const c = await cycle(ids.payable, "PAYABLE");
            assert.equal(c.recognizedAmount, 100);
            assert.equal(c.paidAmount, 100);
            assert.equal(c.transferredAmount, 0);
            assert.equal(c.remainingAmount, 0);
            assert.equal(c.totalAmount, 100);
            assert.equal(c.status, "PAID");
        }));

    it("obrigação com pagamento parcial => PARTIAL", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("ACCRUAL", [debit(ids.payable, 100), credit(ids.category, 100)]);
            await entry("SETTLEMENT", [debit(ids.wallet, 40), credit(ids.payable, 40)]);

            const c = await cycle(ids.payable, "PAYABLE");
            assert.equal(c.totalAmount, 100);
            assert.equal(c.paidAmount, 40);
            assert.equal(c.remainingAmount, 60);
            assert.equal(c.status, "PARTIAL");
        }));

    it("fatura de cartão: dívida recebida por TRANSFER entra no total, o pagamento parcial só no pago", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            // compra no cartão
            await entry("DIRECT", [debit(ids.card, 100), credit(ids.category, 100)]);
            // dívida de outra obrigação que passa para o cartão (aumenta o saldo do cartão)
            await entry("TRANSFER", [debit(ids.card, 50), credit(ids.payable, 50)]);
            // pagamento parcial da fatura
            await entry("SETTLEMENT", [debit(ids.wallet, 100), credit(ids.card, 100)]);

            const c = await cycle(ids.card, "CREDIT");
            assert.equal(c.recognizedAmount, 150);
            assert.equal(c.totalAmount, 150);
            assert.equal(c.paidAmount, 100);
            assert.equal(c.transferredAmount, 0);
            assert.equal(c.remainingAmount, 50);
            assert.equal(c.status, "PARTIAL");
        }));

    it("fatura paga por inteiro com dívida recebida por TRANSFER => PAID", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("DIRECT", [debit(ids.card, 100), credit(ids.category, 100)]);
            await entry("TRANSFER", [debit(ids.card, 50), credit(ids.payable, 50)]);
            await entry("SETTLEMENT", [debit(ids.wallet, 150), credit(ids.card, 150)]);

            const c = await cycle(ids.card, "CREDIT");
            assert.equal(c.totalAmount, 150);
            assert.equal(c.paidAmount, 150);
            assert.equal(c.remainingAmount, 0);
            assert.equal(c.status, "PAID");
        }));

    it("obrigação cuja dívida saiu por TRANSFER => TRANSFERRED (não PAID)", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("ACCRUAL", [debit(ids.payable, 50), credit(ids.category, 50)]);
            await entry("TRANSFER", [debit(ids.card, 50), credit(ids.payable, 50)]);

            const c = await cycle(ids.payable, "PAYABLE");
            assert.equal(c.recognizedAmount, 50);
            assert.equal(c.totalAmount, 50);
            assert.equal(c.paidAmount, 0);
            assert.equal(c.transferredAmount, 50);
            assert.equal(c.remainingAmount, 0);
            assert.equal(c.status, "TRANSFERRED");
        }));

    it("parcelamento em fatura: a dívida da parcela passa ao cartão => TRANSFERRED e o cartão a reconhece", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("ACCRUAL", [debit(ids.installment, 50), credit(ids.category, 50)]);
            await entry("TRANSFER", [credit(ids.installment, 50), debit(ids.card, 50)]);

            const parcela = await cycle(ids.installment, "INSTALLMENT");
            assert.equal(parcela.recognizedAmount, 50);
            assert.equal(parcela.paidAmount, 0);
            assert.equal(parcela.transferredAmount, 50);
            assert.equal(parcela.remainingAmount, 0);
            assert.equal(parcela.status, "TRANSFERRED");

            const fatura = await cycle(ids.card, "CREDIT");
            assert.equal(fatura.totalAmount, 50);
            assert.equal(fatura.remainingAmount, 50);
        }));

    it("parcelamento mês a mês: liquidação da carteira => PAID", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("ACCRUAL", [debit(ids.installment, 50), credit(ids.category, 50)]);
            await entry("SETTLEMENT", [debit(ids.wallet, 50), credit(ids.installment, 50)]);

            const parcela = await cycle(ids.installment, "INSTALLMENT");
            assert.equal(parcela.paidAmount, 50);
            assert.equal(parcela.transferredAmount, 0);
            assert.equal(parcela.remainingAmount, 0);
            assert.equal(parcela.status, "PAID");
        }));

    it("filtro por status respeita o sentido da perna (PAID / TRANSFERRED)", () =>
        inRollback(async (tx) => {
            const { ids, entry, filtered } = await setup(tx);
            await entry("ACCRUAL", [debit(ids.payable, 50), credit(ids.category, 50)]);
            await entry("DIRECT", [debit(ids.card, 100), credit(ids.category, 100)]);
            // dívida da obrigação passa para o cartão (reduz a obrigação, aumenta o cartão)
            await entry("TRANSFER", [debit(ids.card, 50), credit(ids.payable, 50)]);

            // obrigação de origem: transferida, nunca paga
            assert.equal((await filtered(ids.payable, "PAYABLE", ["TRANSFERRED"])).length, 1);
            assert.equal((await filtered(ids.payable, "PAYABLE", ["PAID"])).length, 0);
            // cartão que recebeu a dívida: nem paga, nem transferida
            assert.equal((await filtered(ids.card, "CREDIT", ["TRANSFERRED"])).length, 0);
            assert.equal((await filtered(ids.card, "CREDIT", ["PAID"])).length, 0);
            assert.equal((await filtered(ids.card, "CREDIT", ["PARTIAL"])).length, 0);
        }));

    it("janela futura sem movimentos => PROJECTED", () =>
        inRollback(async (tx) => {
            const { ids, cycle } = await setup(tx);
            const c = await cycle(ids.payable, "PAYABLE", DECEMBER);
            assert.equal(c.movementsCount, 0);
            assert.equal(c.status, "PROJECTED");
        }));

    it("cobrança (claim): abertura, pagamento e recebimento mantêm os números", () =>
        inRollback(async (tx) => {
            const { ids, entry, cycle } = await setup(tx);
            await entry("CLAIM_OPENING", [debit(ids.payable, 80), credit(ids.receivable, 80)]);
            await entry("CLAIM_PAYMENT", [debit(ids.wallet, 80), credit(ids.payable, 80)]);
            await entry("CLAIM_RECEIPT", [debit(ids.receivable, 80), credit(ids.wallet, 80)]);

            const payable = await cycle(ids.payable, "PAYABLE");
            assert.equal(payable.recognizedAmount, 80);
            assert.equal(payable.paidAmount, 80);
            assert.equal(payable.transferredAmount, 0);
            assert.equal(payable.remainingAmount, 0);
            assert.equal(payable.status, "PAID");

            const receivable = await cycle(ids.receivable, "RECEIVABLE");
            assert.equal(receivable.recognizedAmount, 80);
            assert.equal(receivable.paidAmount, 80);
            assert.equal(receivable.transferredAmount, 0);
            assert.equal(receivable.remainingAmount, 0);
            assert.equal(receivable.status, "PAID");
        }));
});
