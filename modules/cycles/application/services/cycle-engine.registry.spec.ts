import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    CYCLE_ENGINE_REGISTRY,
    CycleEngineRegistry,
    type AgreementScheduleContext,
    type CycleRuleRecord,
} from "./cycle-engine.registry";

/** Datas locais (sem fuso) para não depender do TZ da máquina. */
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const rule = (overrides: Partial<CycleRuleRecord> = {}): CycleRuleRecord => ({
    id: 1,
    agreementId: 1,
    dueDay: 10,
    dueMonth: null,
    closingDay: null,
    closingMonth: null,
    effectiveFrom: day(2026, 1, 1),
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

const geometry = (
    frequency: AgreementScheduleContext["frequency"],
    cursor: Date,
    r: CycleRuleRecord,
    ag = agreement(frequency)
) => {
    const g = CycleEngineRegistry.getStrategy(frequency).resolveGeometryForDate(cursor, ag, r);
    return {
        begins: ymd(g.beginsAt),
        ends: ymd(g.endsAt),
        closing: g.closingDate && ymd(g.closingDate),
        due: ymd(g.dueDate),
        label: g.label,
    };
};

describe("CycleEngineRegistry", () => {
    it("possui uma estratégia para cada frequência", () => {
        for (const f of ["ONCE", "WEEKLY", "MONTHLY", "YEARLY"] as const) {
            assert.equal(CycleEngineRegistry.getStrategy(f), CYCLE_ENGINE_REGISTRY[f]);
            assert.equal(typeof CycleEngineRegistry.getStrategy(f).resolveGeometryForDate, "function");
        }
    });
});

describe("estratégia MONTHLY", () => {
    it("sem fechamento o ciclo é o mês civil e o vencimento é o dueDay", () => {
        assert.deepEqual(geometry("MONTHLY", day(2026, 2, 10), rule()), {
            begins: "2026-02-01",
            ends: "2026-02-28",
            closing: null,
            due: "2026-02-10",
            label: "Fevereiro 2026",
        });
    });

    it("dueDay 31 em mês curto é limitado ao último dia do mês", () => {
        const g = geometry("MONTHLY", day(2026, 2, 10), rule({ dueDay: 31 }));
        assert.equal(g.due, "2026-02-28");
        const leap = geometry("MONTHLY", day(2028, 2, 10), rule({ dueDay: 31, effectiveFrom: day(2028, 1, 1) }), agreement("MONTHLY", { startsAt: day(2028, 1, 1) }));
        assert.equal(leap.due, "2028-02-29");
    });

    it("fatura de cartão: do dia seguinte ao fechamento anterior até o fechamento, vencendo no mesmo mês", () => {
        assert.deepEqual(geometry("MONTHLY", day(2026, 2, 10), rule({ closingDay: 3, dueDay: 10 })), {
            begins: "2026-02-04",
            ends: "2026-03-03",
            closing: "2026-03-03",
            due: "2026-03-10",
            label: "Março 2026",
        });
    });

    it("quando o vencimento é anterior ao fechamento, vence no mês seguinte", () => {
        const g = geometry("MONTHLY", day(2026, 2, 10), rule({ closingDay: 25, dueDay: 5 }));
        assert.equal(g.begins, "2026-01-26");
        assert.equal(g.ends, "2026-02-25");
        assert.equal(g.due, "2026-03-05");
    });

    it("o fechamento no dia do cursor pertence ao ciclo que fecha nesse dia", () => {
        const g = geometry("MONTHLY", day(2026, 2, 3), rule({ closingDay: 3 }));
        assert.equal(g.ends, "2026-02-03");
        const next = geometry("MONTHLY", day(2026, 2, 4), rule({ closingDay: 3 }));
        assert.equal(next.begins, "2026-02-04");
    });

    it("intervalo trimestral agrupa três meses", () => {
        const g = geometry("MONTHLY", day(2026, 2, 10), rule(), agreement("MONTHLY", { interval: 3 }));
        assert.equal(g.begins, "2026-01-01");
        assert.equal(g.ends, "2026-03-31");
    });

    it("cursor anterior à vigência da regra ainda resolve um ciclo contíguo", () => {
        const g = geometry("MONTHLY", day(2025, 11, 20), rule());
        assert.equal(g.begins, "2025-11-01");
        assert.equal(g.ends, "2025-11-30");
    });

    it("stepDate avança e recua em meses, respeitando o intervalo", () => {
        const s = CYCLE_ENGINE_REGISTRY.MONTHLY;
        assert.equal(ymd(s.stepDate(day(2026, 1, 31), 1, 1)), "2026-02-28");
        assert.equal(ymd(s.stepDate(day(2026, 5, 15), -2, 1)), "2026-03-15");
        assert.equal(ymd(s.stepDate(day(2026, 1, 10), 1, 3)), "2026-04-10");
        assert.equal(ymd(s.stepDate(day(2026, 1, 10), 1, 0)), "2026-02-10");
    });
});

describe("estratégia ONCE", () => {
    it("sem data final usa o dia de início e projeta o vencimento no mês", () => {
        const g = geometry(
            "ONCE",
            day(2026, 2, 5),
            rule({ dueDay: 31, closingDay: 15 }),
            agreement("ONCE", { startsAt: day(2026, 2, 5) })
        );
        assert.deepEqual(g, {
            begins: "2026-02-05",
            ends: "2026-02-05",
            closing: "2026-02-15",
            due: "2026-02-28",
            label: "28/02/2026",
        });
    });

    it("com data final o vencimento é a data final do acordo", () => {
        const g = geometry(
            "ONCE",
            day(2026, 3, 1),
            rule(),
            agreement("ONCE", { startsAt: day(2026, 3, 1), endsAt: day(2026, 3, 20) })
        );
        assert.equal(g.begins, "2026-03-01");
        assert.equal(g.ends, "2026-03-20");
        assert.equal(g.due, "2026-03-20");
        assert.equal(g.label, "20/03/2026");
    });

    it("stepDate não desloca a data", () => {
        assert.equal(ymd(CYCLE_ENGINE_REGISTRY.ONCE.stepDate(day(2026, 6, 6), 5, 2)), "2026-06-06");
    });
});

describe("estratégia WEEKLY", () => {
    it("o ciclo semanal tem 7 dias, contém o cursor e vence no dia da semana configurado", () => {
        const g = geometry("WEEKLY", day(2026, 1, 14), rule({ dueDay: 5 }));
        assert.deepEqual(g, {
            begins: "2026-01-10",
            ends: "2026-01-16",
            closing: null,
            due: "2026-01-16",
            label: "10/01 - 16/01/2026",
        });
    });

    it("com closingDay informa a data de fechamento", () => {
        const g = geometry("WEEKLY", day(2026, 1, 14), rule({ dueDay: 5, closingDay: 5 }));
        assert.equal(g.closing, g.ends);
    });

    it("intervalo quinzenal gera ciclos de 14 dias", () => {
        const g = geometry("WEEKLY", day(2026, 1, 14), rule({ dueDay: 5 }), agreement("WEEKLY", { interval: 2 }));
        const days = (new Date(g.ends).getTime() - new Date(g.begins).getTime()) / 86_400_000 + 1;
        assert.equal(days, 14);
        assert.ok(g.begins <= "2026-01-14" && "2026-01-14" <= g.ends);
    });

    it("para qualquer cursor o ciclo resolvido contém o cursor", () => {
        for (let i = 0; i < 60; i++) {
            const cursor = new Date(2026, 0, 1 + i);
            const g = geometry("WEEKLY", cursor, rule({ dueDay: 3 }));
            assert.ok(g.begins <= ymd(cursor) && ymd(cursor) <= g.ends, ymd(cursor));
        }
    });

    it("stepDate avança semanas multiplicadas pelo intervalo", () => {
        const s = CYCLE_ENGINE_REGISTRY.WEEKLY;
        assert.equal(ymd(s.stepDate(day(2026, 1, 14), 1, 1)), "2026-01-21");
        assert.equal(ymd(s.stepDate(day(2026, 1, 14), -1, 2)), "2025-12-31");
        assert.equal(ymd(s.stepDate(day(2026, 1, 14), 1, 0)), "2026-01-21");
    });
});

describe("estratégia YEARLY", () => {
    it("ciclo anual vence no mês/dia configurados e é rotulado pelo ano do vencimento", () => {
        assert.deepEqual(geometry("YEARLY", day(2026, 6, 1), rule({ dueMonth: 3, dueDay: 10 })), {
            begins: "2026-03-11",
            ends: "2027-03-10",
            closing: null,
            due: "2027-03-10",
            label: "2027",
        });
    });

    it("cursor antes do vencimento do ano pertence ao ciclo que termina nele", () => {
        const g = geometry("YEARLY", day(2026, 2, 1), rule({ dueMonth: 3, dueDay: 10 }));
        assert.equal(g.begins, "2025-03-11");
        assert.equal(g.ends, "2026-03-10");
        assert.equal(g.label, "2026");
    });

    it("sem mês configurado assume dezembro", () => {
        const g = geometry("YEARLY", day(2026, 6, 1), rule({ dueDay: 15 }));
        assert.equal(g.ends, "2026-12-15");
    });

    it("fechamento e vencimento em meses diferentes: vencimento antes do fechamento vai para o ano seguinte", () => {
        const g = geometry("YEARLY", day(2026, 6, 1), rule({ closingMonth: 11, closingDay: 30, dueMonth: 2, dueDay: 10 }));
        assert.equal(g.ends, "2026-11-30");
        assert.equal(g.closing, "2026-11-30");
        assert.equal(g.due, "2027-02-10");
    });

    it("intervalo bienal cobre dois anos", () => {
        const g = geometry("YEARLY", day(2026, 6, 1), rule({ dueMonth: 3, dueDay: 10 }), agreement("YEARLY", { interval: 2 }));
        assert.equal(g.begins, "2026-03-11");
        assert.equal(g.ends, "2028-03-10");
    });

    it("stepDate avança anos pelo intervalo", () => {
        const s = CYCLE_ENGINE_REGISTRY.YEARLY;
        assert.equal(ymd(s.stepDate(day(2026, 2, 28), 1, 1)), "2027-02-28");
        assert.equal(ymd(s.stepDate(day(2026, 6, 1), -1, 2)), "2024-06-01");
    });
});
