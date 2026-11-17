import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CreateRecurrenceRepositoryDTO } from "../../application/interfaces/recurrence-repository.interface";
import {
    buildAgreementCreate,
    parseCivilDateUtc,
    toBalanceType,
} from "./recurrence-write.mapper";

const base: CreateRecurrenceRepositoryDTO = {
    contextId: 1,
    direction: "DEBIT",
    name: "Aluguel",
    amount: 250000,
    frequency: "MONTHLY",
    startDate: "2026-11-17",
    hasCustomClosingDate: false,
    dueDay: 10,
    closingDay: 5,
    dueMonth: 11,
    closingMonth: 11,
    subcategoryId: 7,
};

describe("recurrence-write.mapper", () => {
    it("mapeia a natureza para o tipo de balance", () => {
        assert.equal(toBalanceType("DEBIT"), "PAYABLE");
        assert.equal(toBalanceType("CREDIT"), "RECEIVABLE");
    });

    it("converte a data civil para meia-noite UTC", () => {
        assert.equal(parseCivilDateUtc("2026-11-17").toISOString(), "2026-11-17T00:00:00.000Z");
        assert.throws(() => parseCivilDateUtc("17/11/2026"));
    });

    it("monta o agreement com regra de ciclo e valor inicial", () => {
        const a = buildAgreementCreate(base);
        assert.equal(a.frequency, "MONTHLY");
        assert.equal(a.interval, 1);
        assert.equal(a.includeInProjection, true);
        assert.equal(a.endsAt, null);
        assert.equal(a.startsAt.toISOString(), "2026-11-17T00:00:00.000Z");
        assert.equal(a.rules.create.effectiveFrom.getTime(), a.startsAt.getTime());
        assert.deepEqual(a.amountEntries.create, {
            amount: 250000,
            effectiveAt: a.startsAt,
            reason: "Valor inicial",
        });
    });

    it("mensal: sem fechamento próprio, grava só o dia de vencimento", () => {
        const rule = buildAgreementCreate(base).rules.create;
        assert.equal(rule.dueDay, 10);
        assert.equal(rule.dueMonth, null);
        assert.equal(rule.closingDay, null);
        assert.equal(rule.closingMonth, null);
    });

    it("mensal: com fechamento próprio, grava o dia de fechamento (sem meses)", () => {
        const rule = buildAgreementCreate({ ...base, hasCustomClosingDate: true }).rules.create;
        assert.equal(rule.closingDay, 5);
        assert.equal(rule.dueMonth, null);
        assert.equal(rule.closingMonth, null);
    });

    it("anual: grava mês de vencimento e, com fechamento próprio, dia e mês de fechamento", () => {
        const yearly = { ...base, frequency: "YEARLY" as const, dueDay: 20, dueMonth: 3 };
        const noClosing = buildAgreementCreate(yearly).rules.create;
        assert.equal(noClosing.dueMonth, 3);
        assert.equal(noClosing.closingDay, null);
        assert.equal(noClosing.closingMonth, null);

        const withClosing = buildAgreementCreate({
            ...yearly,
            hasCustomClosingDate: true,
            closingDay: 10,
            closingMonth: 2,
        }).rules.create;
        assert.equal(withClosing.closingDay, 10);
        assert.equal(withClosing.closingMonth, 2);
    });

    it("semanal: usa o dia da semana e ignora os meses", () => {
        const rule = buildAgreementCreate({
            ...base,
            frequency: "WEEKLY",
            dueDay: 1,
            hasCustomClosingDate: true,
            closingDay: 5,
        }).rules.create;
        assert.equal(rule.dueDay, 1);
        assert.equal(rule.closingDay, 5);
        assert.equal(rule.dueMonth, null);
        assert.equal(rule.closingMonth, null);
    });
});
