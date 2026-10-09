import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { format } from "date-fns";
import { CycleEngineRegistry } from "./cycle-engine.registry";
import { CycleRuleWithEntriesData } from "../types/commitment-cycle-engine.interface";

const civilDate = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day);

describe("CycleEngineRegistry", () => {
    describe("MONTHLY Strategy", () => {
        const strategy = CycleEngineRegistry.getStrategy("MONTHLY");

        it("should shift referenceDate to next month when date is after closingDay", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 1,
                agreementId: 10,
                effectiveFrom: civilDate(2026, 1, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 25,
                dueDay: 5,
                entries: [],
            };

            // Dia 24 (antes ou no fechamento): permanece no mesmo mês
            const refBefore = strategy.resolveReferenceDate(
                civilDate(2026, 10, 24),
                rule
            );
            assert.equal(refBefore.getMonth(), 9); // Outubro (0-indexed = 9)

            // Dia 28 (após fechamento): desloca para o próximo mês (Novembro)
            const refAfter = strategy.resolveReferenceDate(
                civilDate(2026, 10, 28),
                rule
            );
            assert.equal(refAfter.getMonth(), 10); // Novembro (0-indexed = 10)
        });

        it("should calculate boundaries correctly with closingDay and dueDay < closingDay", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 1,
                agreementId: 10,
                effectiveFrom: civilDate(2026, 1, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 25,
                dueDay: 5,
                entries: [],
            };

            const boundaries = strategy.getCycleBoundaries(
                civilDate(2026, 10, 15),
                rule
            );

            assert.equal(boundaries.cycleKey, "2026-10");
            // Início é o dia seguinte ao fechamento do mês anterior (25/set + 1 dia = 26/set)
            assert.equal(format(boundaries.beginsAt, "yyyy-MM-dd"), "2026-09-26");
            // Fim é o fechamento deste mês (25/out)
            assert.equal(format(boundaries.endsAt, "yyyy-MM-dd"), "2026-10-25");
            // Como dueDay (5) < closingDay (25), vence no mês seguinte ao fechamento (05/nov)
            assert.equal(format(boundaries.dueDate, "yyyy-MM-dd"), "2026-11-05");
            assert.equal(boundaries.label, "Outubro 2026");
        });

        it("should handle February clamped closingDay correctly without spuriously shifting beginsAt", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 2,
                agreementId: 11,
                effectiveFrom: civilDate(2026, 1, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 31,
                dueDay: 10,
                entries: [],
            };

            // Fevereiro de 2026 tem 28 dias
            const boundaries = strategy.getCycleBoundaries(
                civilDate(2026, 2, 15),
                rule
            );

            assert.equal(boundaries.cycleKey, "2026-02");
            // Janeiro fechou dia 31, logo fevereiro começa em 01/fev
            assert.equal(format(boundaries.beginsAt, "yyyy-MM-dd"), "2026-02-01");
            // Fevereiro fecha em 28/fev (clamp de 31 no mês de 28 dias)
            assert.equal(format(boundaries.endsAt, "yyyy-MM-dd"), "2026-02-28");
            // Vencimento: dueDay (10) < closingDay (31), logo vence no mês seguinte (10/mar)
            assert.equal(format(boundaries.dueDate, "yyyy-MM-dd"), "2026-03-10");
        });

        it("should calculate boundaries without closingDay (standard calendar month)", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 3,
                agreementId: 12,
                effectiveFrom: civilDate(2026, 1, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: null,
                dueDay: 15,
                entries: [],
            };

            const boundaries = strategy.getCycleBoundaries(
                civilDate(2026, 10, 10),
                rule
            );

            assert.equal(boundaries.cycleKey, "2026-10");
            assert.equal(format(boundaries.beginsAt, "yyyy-MM-dd"), "2026-10-01");
            assert.equal(format(boundaries.endsAt, "yyyy-MM-dd"), "2026-10-31");
            assert.equal(format(boundaries.dueDate, "yyyy-MM-dd"), "2026-10-15");
            assert.equal(boundaries.label, "Outubro 2026");
        });

        it("should support interval > 1 spanning multiple months", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 4,
                agreementId: 13,
                effectiveFrom: civilDate(2026, 1, 1),
                frequency: "MONTHLY",
                interval: 3, // Trimestral
                closingDay: null,
                dueDay: 20,
                entries: [],
            };

            const boundaries = strategy.getCycleBoundaries(
                civilDate(2026, 2, 15),
                rule
            );

            assert.equal(boundaries.cycleKey, "2026-01");
            assert.equal(format(boundaries.beginsAt, "yyyy-MM-dd"), "2026-01-01");
            assert.equal(format(boundaries.endsAt, "yyyy-MM-dd"), "2026-03-31");
            assert.equal(format(boundaries.dueDate, "yyyy-MM-dd"), "2026-03-20");
        });
    });

    describe("WEEKLY Strategy", () => {
        const strategy = CycleEngineRegistry.getStrategy("WEEKLY");

        it("should calculate ISO week boundaries with clamped dueDay", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 5,
                agreementId: 14,
                effectiveFrom: civilDate(2026, 1, 1),
                frequency: "WEEKLY",
                interval: 1,
                closingDay: null,
                dueDay: 5, // Sexta-feira
                entries: [],
            };

            // Quarta-feira, 7 de outubro de 2026
            const boundaries = strategy.getCycleBoundaries(
                civilDate(2026, 10, 7),
                rule
            );

            // Segunda-feira (05/out) a Domingo (11/out)
            assert.equal(format(boundaries.beginsAt, "yyyy-MM-dd"), "2026-10-05");
            assert.equal(format(boundaries.endsAt, "yyyy-MM-dd"), "2026-10-11");
            // Sexta-feira (09/out)
            assert.equal(format(boundaries.dueDate, "yyyy-MM-dd"), "2026-10-09");
            assert.match(boundaries.cycleKey, /^2026-W\d+$/);
        });
    });

    describe("YEARLY Strategy", () => {
        const strategy = CycleEngineRegistry.getStrategy("YEARLY");

        it("should calculate yearly boundaries with dueDate in rule's effectiveFrom month", () => {
            const rule: CycleRuleWithEntriesData = {
                id: 6,
                agreementId: 15,
                effectiveFrom: civilDate(2026, 3, 1), // Março
                frequency: "YEARLY",
                interval: 1,
                closingDay: null,
                dueDay: 15,
                entries: [],
            };

            const boundaries = strategy.getCycleBoundaries(
                civilDate(2026, 8, 20),
                rule
            );

            assert.equal(boundaries.cycleKey, "2026");
            assert.equal(format(boundaries.beginsAt, "yyyy-MM-dd"), "2026-01-01");
            assert.equal(format(boundaries.endsAt, "yyyy-MM-dd"), "2026-12-31");
            assert.equal(format(boundaries.dueDate, "yyyy-MM-dd"), "2026-03-15");
            assert.equal(boundaries.label, "Ano 2026");
        });
    });
});
