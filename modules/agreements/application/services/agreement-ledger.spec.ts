import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    hasEntriesAfter,
    resolveEffectiveRule,
    sumEffectiveAmount,
    toAmountDelta,
} from "./agreement-ledger";

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const today = at(2026, 11, 17);

const entries = [
    { amount: 100000, effectiveAt: at(2026, 1, 10) },
    { amount: 50000, effectiveAt: at(2026, 12, 5) },
];

describe("sumEffectiveAmount", () => {
    it("ignora linhas com vigência futura", () => {
        assert.equal(sumEffectiveAmount(entries, today), 100000);
    });

    it("inclui a linha no próprio dia da vigência", () => {
        assert.equal(sumEffectiveAmount(entries, at(2026, 12, 5)), 150000);
    });

    it("não fica negativo", () => {
        assert.equal(sumEffectiveAmount([{ amount: -10, effectiveAt: at(2026, 1, 1) }], today), 0);
    });
});

describe("toAmountDelta / hasEntriesAfter", () => {
    it("calcula o delta contra o valor vigente na data", () => {
        assert.equal(toAmountDelta(120000, entries, today), 20000);
        assert.equal(toAmountDelta(80000, entries, today), -20000);
        assert.equal(toAmountDelta(100000, entries, today), 0);
    });

    it("detecta linha agendada depois da data", () => {
        assert.equal(hasEntriesAfter(entries, today), true);
        assert.equal(hasEntriesAfter(entries, at(2026, 12, 5)), false);
    });
});

describe("resolveEffectiveRule", () => {
    const rule = (id: number, iso: string) => ({ id, effectiveFrom: new Date(`${iso}T00:00:00.000Z`) });

    it("usa a regra de maior vigência que já começou, não a mais recente", () => {
        const rules = [rule(1, "2026-01-01"), rule(2, "2026-11-10"), rule(3, "2026-12-11")];
        assert.equal(resolveEffectiveRule(rules, today)?.id, 2);
    });

    it("no dia da vigência a regra já vale (sem deslocar por fuso)", () => {
        assert.equal(resolveEffectiveRule([rule(1, "2026-01-01"), rule(2, "2026-11-17")], today)?.id, 2);
    });

    it("se todas forem futuras, usa a mais antiga", () => {
        assert.equal(resolveEffectiveRule([rule(2, "2027-01-01"), rule(1, "2026-12-01")], today)?.id, 1);
    });

    it("retorna undefined sem regras", () => {
        assert.equal(resolveEffectiveRule([], today), undefined);
    });
});
