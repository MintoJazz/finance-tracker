import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInstallmentSchedule } from "../../application/services/installment-schedule.calculator";
import {
    buildInstallmentAgreementCreate,
    buildInstallmentEntries,
} from "./installment-write.mapper";

const INSTALLMENT = 10;
const CATEGORY = 20;
const CARD = 30;

const schedule = buildInstallmentSchedule({ firstDate: "2030-11-15", total: 10000, count: 3 });
const entries = (cardId: number | null) =>
    buildInstallmentEntries({
        name: "Notebook",
        installmentId: INSTALLMENT,
        subcategoryId: CATEGORY,
        cardId,
        schedule,
    });

describe("buildInstallmentEntries", () => {
    it("mês a mês: um ACCRUAL por parcela, sem perna de cartão", () => {
        const list = entries(null);
        assert.equal(list.length, 3);
        assert.ok(list.every((e) => e.type === "ACCRUAL"));
        assert.deepEqual(
            list.map((e) => e.description),
            ["Notebook (1/3)", "Notebook (2/3)", "Notebook (3/3)"]
        );
    });

    it("fatura: ACCRUAL + TRANSFER por parcela (2N entries), nessa ordem", () => {
        const list = entries(CARD);
        assert.equal(list.length, 6);
        assert.deepEqual(
            list.map((e) => e.type),
            ["ACCRUAL", "TRANSFER", "ACCRUAL", "TRANSFER", "ACCRUAL", "TRANSFER"]
        );
    });

    it("todo Entry fecha em zero e tem exatamente duas pernas", () => {
        for (const e of entries(CARD)) {
            assert.equal(e.movements.length, 2);
            assert.equal(e.movements.reduce((acc, m) => acc + m.amount, 0), 0);
        }
    });

    it("sinais e direções: ACCRUAL (parcelamento -v / categoria +v) e TRANSFER (parcelamento +v / cartão -v)", () => {
        const [accrual, transfer] = entries(CARD);
        assert.deepEqual(accrual.movements, [
            { balanceId: INSTALLMENT, amount: -3333, direction: "DEBIT" },
            { balanceId: CATEGORY, amount: 3333, direction: "CREDIT" },
        ]);
        assert.deepEqual(transfer.movements, [
            { balanceId: INSTALLMENT, amount: 3333, direction: "CREDIT" },
            { balanceId: CARD, amount: -3333, direction: "DEBIT" },
        ]);
    });

    it("cada ACCRUAL tem uma única perna de categoria, e a soma das parcelas é o total", () => {
        const accruals = entries(CARD).filter((e) => e.type === "ACCRUAL");
        for (const e of accruals) {
            assert.equal(e.movements.filter((m) => m.balanceId === CATEGORY).length, 1);
        }
        const total = accruals.reduce(
            (acc, e) => acc + e.movements.find((m) => m.balanceId === CATEGORY)!.amount,
            0
        );
        assert.equal(total, 10000);
    });

    it("datas às 12:00 UTC, com vencimento e competência iguais, mês a mês", () => {
        const accruals = entries(null);
        assert.deepEqual(
            accruals.map((e) => e.dueDate.toISOString()),
            ["2030-11-15T12:00:00.000Z", "2030-12-15T12:00:00.000Z", "2031-01-15T12:00:00.000Z"]
        );
        assert.ok(accruals.every((e) => e.dueDate.getTime() === e.competanceDate.getTime()));
    });

    it("a parcela em fatura tem o TRANSFER na mesma data do ACCRUAL (mesma referência)", () => {
        const [accrual, transfer] = entries(CARD);
        assert.equal(accrual.competanceDate.getTime(), transfer.competanceDate.getTime());
    });
});

describe("buildInstallmentAgreementCreate", () => {
    it("Agreement MONTHLY finito: da 1ª à última parcela, com dia de vencimento da 1ª", () => {
        const agreement = buildInstallmentAgreementCreate(schedule);
        assert.equal(agreement.frequency, "MONTHLY");
        assert.equal(agreement.interval, 1);
        assert.equal(agreement.isActive, true);
        assert.equal((agreement.startsAt as Date).toISOString(), "2030-11-15T00:00:00.000Z");
        assert.equal((agreement.endsAt as Date).toISOString(), "2031-01-15T00:00:00.000Z");

        const rule = (agreement.rules as { create: { dueDay: number; effectiveFrom: Date } }).create;
        assert.equal(rule.dueDay, 15);
        assert.equal(rule.effectiveFrom.getTime(), (agreement.startsAt as Date).getTime());
    });

    it("com resto: valor base na 1ª data e delta (resto) na data da última parcela", () => {
        const agreement = buildInstallmentAgreementCreate(schedule);
        const list = (agreement.amountEntries as { create: { amount: number }[] }).create;
        assert.equal(list.length, 2);
        assert.equal(list[0].amount, 3333);
        assert.equal(list[1].amount, 1); // 3334 - 3333
        assert.equal(list[0].amount + list[1].amount, schedule[2].amount);
    });

    it("sem resto: só o valor base", () => {
        const even = buildInstallmentSchedule({ firstDate: "2030-11-15", total: 30000, count: 3 });
        const list = (buildInstallmentAgreementCreate(even).amountEntries as {
            create: { amount: number }[];
        }).create;
        assert.equal(list.length, 1);
        assert.equal(list[0].amount, 10000);
    });
});
