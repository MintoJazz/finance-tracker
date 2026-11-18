import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CycleRuleRecord } from "@/modules/cycles/application/services/cycle-engine.registry";
import { resolveEffectiveDate } from "./effective-date.resolver";

// 2026-11-17 é terça-feira
const today = new Date(2026, 10, 17, 10);
const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const rule = (over: Partial<CycleRuleRecord> = {}): CycleRuleRecord => ({
    id: 1,
    agreementId: 1,
    dueDay: 20,
    dueMonth: null,
    closingDay: null,
    closingMonth: null,
    effectiveFrom: utc("2026-01-01"),
    ...over,
});

const agreement = (frequency: "MONTHLY" | "WEEKLY" | "YEARLY") => ({
    frequency,
    interval: 1,
    startsAt: utc("2026-01-01"),
    endsAt: null,
});

const resolve = (
    over: Partial<Parameters<typeof resolveEffectiveDate>[0]>
) =>
    resolveEffectiveDate({
        mode: "NOW",
        today,
        agreement: agreement("MONTHLY"),
        rules: [rule()],
        ...over,
    });

describe("resolveEffectiveDate", () => {
    it("NOW devolve hoje", () => {
        assert.equal(resolve({ mode: "NOW" }), "2026-11-17");
    });

    it("DATE aceita hoje e futuro, recusa passado e ausência", () => {
        assert.equal(resolve({ mode: "DATE", effectiveFrom: "2026-11-17" }), "2026-11-17");
        assert.equal(resolve({ mode: "DATE", effectiveFrom: "2027-02-01" }), "2027-02-01");
        assert.throws(() => resolve({ mode: "DATE", effectiveFrom: "2026-11-16" }), /passado/);
        assert.throws(() => resolve({ mode: "DATE", effectiveFrom: null }), /Informe a data/);
    });

    it("NEXT_CYCLE mensal sem fechamento: 1º dia do mês seguinte", () => {
        assert.equal(resolve({ mode: "NEXT_CYCLE" }), "2026-12-01");
    });

    it("NEXT_CYCLE mensal com fechamento (dia 10, já passou): dia 11 do próximo mês", () => {
        const r = rule({ closingDay: 10, dueDay: 15 });
        assert.equal(resolve({ mode: "NEXT_CYCLE", rules: [r] }), "2026-12-11");
    });

    it("NEXT_CYCLE mensal com fechamento ainda por vir (dia 25): dia 26 deste mês", () => {
        const r = rule({ closingDay: 25, dueDay: 28 });
        assert.equal(resolve({ mode: "NEXT_CYCLE", rules: [r] }), "2026-11-26");
    });

    it("NEXT_CYCLE usa a regra vigente hoje, não uma regra futura", () => {
        const future = rule({ id: 2, closingDay: 3, dueDay: 8, effectiveFrom: utc("2026-12-01") });
        const current = rule({ id: 1, closingDay: 25, dueDay: 28 });
        assert.equal(resolve({ mode: "NEXT_CYCLE", rules: [current, future] }), "2026-11-26");
    });

    it("NEXT_CYCLE semanal: dia seguinte ao fechamento da semana", () => {
        // fechamento na sexta (5) -> sexta 20/11 -> próximo ciclo começa 21/11
        const r = rule({ closingDay: 5, dueDay: 6 });
        assert.equal(
            resolve({ mode: "NEXT_CYCLE", agreement: agreement("WEEKLY"), rules: [r] }),
            "2026-11-21"
        );
    });

    it("NEXT_CYCLE anual: dia seguinte ao fechamento do ano corrente", () => {
        const r = rule({ dueDay: 20, dueMonth: 12 });
        assert.equal(
            resolve({ mode: "NEXT_CYCLE", agreement: agreement("YEARLY"), rules: [r] }),
            "2026-12-21"
        );
    });

    it("NEXT_CYCLE vira o ano", () => {
        const dec = new Date(2026, 11, 20, 10);
        assert.equal(resolve({ mode: "NEXT_CYCLE", today: dec }), "2027-01-01");
    });

    it("NEXT_CYCLE sem regra falha com mensagem clara", () => {
        assert.throws(() => resolve({ mode: "NEXT_CYCLE", rules: [] }), /regra de ciclo/);
    });
});
