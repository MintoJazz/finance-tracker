import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgreementScheduleContext, CycleRuleRecord } from "./cycle-engine.registry";
import { CycleWindowEngine, type CycleWindowBoundaries } from "./cycle-window.engine";

/** Datas locais (sem fuso) para não depender do TZ da máquina. */
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const rule = (id: number, effectiveFrom: Date, overrides: Partial<CycleRuleRecord> = {}): CycleRuleRecord => ({
    id,
    agreementId: 1,
    dueDay: 10,
    dueMonth: null,
    closingDay: null,
    closingMonth: null,
    effectiveFrom,
    ...overrides,
});

const agreement = (
    frequency: AgreementScheduleContext["frequency"],
    overrides: Partial<AgreementScheduleContext> = {}
): AgreementScheduleContext => ({
    frequency,
    interval: 1,
    startsAt: day(2026, 1, 1),
    endsAt: null,
    ...overrides,
});

const janToApr = { from: day(2026, 1, 1), to: day(2026, 4, 30) };

const ranges = (windows: CycleWindowBoundaries[]) => windows.map((w) => [w.range.from, w.range.to]);
const dueDates = (windows: CycleWindowBoundaries[]) => windows.map((w) => ymd(w.dueDate));

/** Cada janela deve começar no dia seguinte ao fim da anterior (sem buracos nem sobreposição). */
function assertContiguous(windows: CycleWindowBoundaries[]) {
    for (let i = 1; i < windows.length; i++) {
        const expected = new Date(windows[i - 1].endsAt);
        expected.setDate(expected.getDate() + 1);
        assert.equal(ymd(windows[i].beginsAt), ymd(expected), `janela ${i} não é contígua`);
    }
}

describe("CycleWindowEngine.generateWindows", () => {
    it("sem regras não gera janelas", () => {
        assert.deepEqual(
            CycleWindowEngine.generateWindows({ agreement: agreement("MONTHLY"), rules: [], window: janToApr }),
            []
        );
    });

    it("mensal sem fechamento gera um ciclo por mês civil com vencimento no dueDay", () => {
        const windows = CycleWindowEngine.generateWindows({
            agreement: agreement("MONTHLY"),
            rules: [rule(1, day(2026, 1, 1))],
            window: janToApr,
        });

        assert.deepEqual(ranges(windows), [
            ["2026-01-01", "2026-01-31"],
            ["2026-02-01", "2026-02-28"],
            ["2026-03-01", "2026-03-31"],
            ["2026-04-01", "2026-04-30"],
        ]);
        assert.deepEqual(dueDates(windows), ["2026-01-10", "2026-02-10", "2026-03-10", "2026-04-10"]);
        assert.ok(windows.every((w) => !w.isBridgeCycle && w.closingDate === null));
    });

    it("com dia de fechamento (fatura de cartão) o ciclo vai do dia seguinte ao fechamento anterior até o fechamento", () => {
        const windows = CycleWindowEngine.generateWindows({
            agreement: agreement("MONTHLY"),
            rules: [rule(1, day(2026, 1, 1), { closingDay: 3 })],
            window: janToApr,
        });

        assert.deepEqual(ranges(windows)[0], ["2025-12-04", "2026-01-03"]);
        assert.deepEqual(ranges(windows)[1], ["2026-01-04", "2026-02-03"]);
        assert.deepEqual(
            windows.map((w) => w.closingDate && ymd(w.closingDate)),
            ["2026-01-03", "2026-02-03", "2026-03-03", "2026-04-03"]
        );
        assertContiguous(windows);
    });

    it("respeita o fim do acordo (não gera ciclos que começam depois dele)", () => {
        const windows = CycleWindowEngine.generateWindows({
            agreement: agreement("MONTHLY", { endsAt: day(2026, 2, 15) }),
            rules: [rule(1, day(2026, 1, 1))],
            window: janToApr,
        });

        assert.deepEqual(ranges(windows), [
            ["2026-01-01", "2026-01-31"],
            ["2026-02-01", "2026-02-28"],
        ]);
    });

    it("intervalo 2 gera ciclos bimestrais", () => {
        const windows = CycleWindowEngine.generateWindows({
            agreement: agreement("MONTHLY", { interval: 2 }),
            rules: [rule(1, day(2026, 1, 1))],
            window: janToApr,
        });

        assert.deepEqual(ranges(windows), [
            ["2026-01-01", "2026-02-28"],
            ["2026-03-01", "2026-04-30"],
        ]);
    });

    it("ONCE gera um único ciclo e some fora do horizonte", () => {
        const inside = CycleWindowEngine.generateWindows({
            agreement: agreement("ONCE"),
            rules: [rule(1, day(2026, 1, 1))],
            window: janToApr,
        });
        assert.equal(inside.length, 1);
        assert.equal(ymd(inside[0].dueDate), "2026-01-10");

        const outside = CycleWindowEngine.generateWindows({
            agreement: agreement("ONCE"),
            rules: [rule(1, day(2026, 1, 1))],
            window: { from: day(2027, 1, 1), to: day(2027, 6, 1) },
        });
        assert.deepEqual(outside, []);
    });

    it("anual e semanal também produzem janelas contíguas e ordenadas", () => {
        const yearly = CycleWindowEngine.generateWindows({
            agreement: agreement("YEARLY"),
            rules: [rule(1, day(2026, 1, 1), { dueMonth: 3 })],
            window: { from: day(2026, 1, 1), to: day(2028, 12, 31) },
        });
        assert.equal(yearly.length, 3);
        assertContiguous(yearly);

        const weekly = CycleWindowEngine.generateWindows({
            agreement: agreement("WEEKLY"),
            rules: [rule(1, day(2026, 1, 1), { dueDay: 5 })],
            window: { from: day(2026, 1, 1), to: day(2026, 1, 31) },
        });
        assert.ok(weekly.length >= 4);
        assertContiguous(weekly);
        for (const w of weekly) assert.ok(w.beginsAt <= w.endsAt);
    });

    it("troca de regra no meio do ciclo cria um ciclo ponte com a nova regra", () => {
        const windows = CycleWindowEngine.generateWindows({
            agreement: agreement("MONTHLY"),
            rules: [rule(1, day(2026, 1, 1), { dueDay: 10 }), rule(2, day(2026, 3, 15), { dueDay: 20 })],
            window: janToApr,
        });

        assert.deepEqual(dueDates(windows), ["2026-01-10", "2026-02-10", "2026-03-20", "2026-04-20"]);
        assert.deepEqual(
            windows.map((w) => w.isBridgeCycle),
            [false, false, true, false]
        );
        assert.deepEqual(
            windows.map((w) => w.rule.id),
            [1, 1, 2, 2]
        );
        assertContiguous(windows);
    });

    it("ordena as regras por vigência mesmo recebidas fora de ordem", () => {
        const input = {
            agreement: agreement("MONTHLY"),
            window: janToApr,
        };
        const ordered = CycleWindowEngine.generateWindows({
            ...input,
            rules: [rule(1, day(2026, 1, 1), { dueDay: 10 }), rule(2, day(2026, 3, 15), { dueDay: 20 })],
        });
        const shuffled = CycleWindowEngine.generateWindows({
            ...input,
            rules: [rule(2, day(2026, 3, 15), { dueDay: 20 }), rule(1, day(2026, 1, 1), { dueDay: 10 })],
        });
        assert.deepEqual(ranges(shuffled), ranges(ordered));
        assert.deepEqual(dueDates(shuffled), dueDates(ordered));
    });

    it("não altera o array de regras recebido", () => {
        const rules = [rule(2, day(2026, 3, 15)), rule(1, day(2026, 1, 1))];
        CycleWindowEngine.generateWindows({ agreement: agreement("MONTHLY"), rules, window: janToApr });
        assert.deepEqual(
            rules.map((r) => r.id),
            [2, 1]
        );
    });

    describe("critério de pertencimento (anchorMode)", () => {
        const narrow = { from: day(2026, 2, 15), to: day(2026, 2, 16) };
        const base = { agreement: agreement("MONTHLY"), rules: [rule(1, day(2026, 1, 1))], window: narrow };

        it("DUE_DATE exige que o vencimento caia dentro da janela", () => {
            assert.deepEqual(CycleWindowEngine.generateWindows(base), []);
        });

        it("OVERLAP inclui o ciclo que apenas intersecta a janela", () => {
            const windows = CycleWindowEngine.generateWindows({ ...base, anchorMode: "OVERLAP" });
            assert.deepEqual(ranges(windows), [["2026-02-01", "2026-02-28"]]);
        });

        it("DUE_DATE inclui o ciclo quando o vencimento está na janela (limite inclusivo)", () => {
            const windows = CycleWindowEngine.generateWindows({
                ...base,
                window: { from: day(2026, 2, 10), to: day(2026, 2, 10) },
            });
            assert.deepEqual(dueDates(windows), ["2026-02-10"]);
        });
    });
});

describe("CycleWindowEngine.resolveWindowForDate", () => {
    it("sem regras retorna null", () => {
        assert.equal(CycleWindowEngine.resolveWindowForDate(new Date(), agreement("MONTHLY"), []), null);
    });

    it("resolve o ciclo que contém a data informada", () => {
        const w = CycleWindowEngine.resolveWindowForDate(
            day(2026, 2, 20),
            agreement("MONTHLY"),
            [rule(1, day(2026, 1, 1))]
        );
        assert.ok(w);
        assert.deepEqual([w.range.from, w.range.to], ["2026-02-01", "2026-02-28"]);
        assert.equal(w.label.length > 0, true);
    });

    it("antes da primeira regra usa a primeira regra disponível", () => {
        const w = CycleWindowEngine.resolveWindowForDate(
            day(2025, 11, 5),
            agreement("MONTHLY"),
            [rule(7, day(2026, 1, 1))]
        );
        assert.equal(w?.rule.id, 7);
    });
});
