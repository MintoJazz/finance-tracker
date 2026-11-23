import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgreementScheduleContext, CycleRuleRecord } from "./cycle-engine.registry";
import { CycleDetailValidator } from "./cycle-detail.validator";
import type { CycleWindowBoundaries } from "./cycle-window.engine";

const rule = {} as CycleRuleRecord;
const window = (from: string, to: string): CycleWindowBoundaries => ({
    range: { from, to },
    beginsAt: new Date(`${from}T00:00:00`),
    endsAt: new Date(`${to}T00:00:00`),
    closingDate: null,
    dueDate: new Date(`${to}T00:00:00`),
    label: `${from}/${to}`,
    rule,
    isBridgeCycle: false,
});

const jan = window("2026-01-01", "2026-01-31");
const feb = window("2026-02-01", "2026-02-28");
const mar = window("2026-03-01", "2026-03-31");
const windows = [jan, feb, mar];

const agreement = (overrides: Partial<AgreementScheduleContext> = {}): AgreementScheduleContext => ({
    frequency: "MONTHLY",
    interval: 1,
    startsAt: new Date(2026, 0, 1),
    endsAt: null,
    ...overrides,
});

const validate = (
    range: { from: string; to: string },
    ag = agreement(),
    generated = windows
) => CycleDetailValidator.validateAndExtractNeighborhood({ requestedRange: range, agreement: ag, generatedWindows: generated });

describe("CycleDetailValidator.validateAndExtractNeighborhood", () => {
    it("devolve anterior, atual e próximo para uma janela do meio", () => {
        const result = validate({ from: "2026-02-01", to: "2026-02-28" });
        assert.equal(result.ok, true);
        if (result.ok) {
            assert.equal(result.value.prev, jan);
            assert.equal(result.value.current, feb);
            assert.equal(result.value.next, mar);
        }
    });

    it("primeira janela não tem anterior; última não tem próxima", () => {
        const first = validate({ from: "2026-01-01", to: "2026-01-31" });
        const last = validate({ from: "2026-03-01", to: "2026-03-31" });
        assert.ok(first.ok && last.ok);
        if (first.ok && last.ok) {
            assert.equal(first.value.prev, null);
            assert.equal(first.value.next, feb);
            assert.equal(last.value.prev, feb);
            assert.equal(last.value.next, null);
        }
    });

    it("rejeita intervalo com início depois do fim", () => {
        const result = validate({ from: "2026-02-28", to: "2026-02-01" });
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "INVALID_RANGE_ORDER");
    });

    it("rejeita ciclo que termina antes do início do acordo", () => {
        const result = validate({ from: "2026-01-01", to: "2026-01-31" }, agreement({ startsAt: new Date(2026, 1, 1) }));
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "OUT_OF_AGREEMENT_BOUNDS");
    });

    it("aceita ciclo que termina exatamente no dia de início do acordo (limite)", () => {
        const result = validate({ from: "2026-01-01", to: "2026-01-31" }, agreement({ startsAt: new Date(2026, 0, 31) }));
        assert.equal(result.ok, true);
    });

    it("rejeita ciclo que começa depois do fim do acordo", () => {
        const result = validate({ from: "2026-03-01", to: "2026-03-31" }, agreement({ endsAt: new Date(2026, 1, 28) }));
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "OUT_OF_AGREEMENT_BOUNDS");
    });

    it("aceita ciclo que começa exatamente no último dia do acordo (limite)", () => {
        const result = validate({ from: "2026-02-01", to: "2026-02-28" }, agreement({ endsAt: new Date(2026, 1, 1) }));
        assert.equal(result.ok, true);
    });

    it("rejeita intervalo que não corresponde a nenhuma janela canônica", () => {
        const result = validate({ from: "2026-02-05", to: "2026-02-28" });
        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "NON_CANONICAL_CYCLE_WINDOW");
            assert.match(result.error.message, /2026-02-05/);
        }
    });

    it("sem janelas geradas, qualquer intervalo é não canônico", () => {
        const result = validate({ from: "2026-01-01", to: "2026-01-31" }, agreement(), []);
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "NON_CANONICAL_CYCLE_WINDOW");
    });
});
