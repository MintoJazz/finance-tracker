import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RecurrenceScheduleCalculator } from "./recurrence-schedule.calculator";

describe("RecurrenceScheduleCalculator", () => {
    describe("resolveIsActive", () => {
        const today = new Date("2026-11-16T10:00:00Z");

        it("deve retornar false se removedAt não for nulo (arquivado)", () => {
            const isActive = RecurrenceScheduleCalculator.resolveIsActive({
                removedAt: new Date("2026-05-01"),
                startsAt: new Date("2025-01-01"),
                endsAt: null,
                today,
            });
            assert.equal(isActive, false);
        });

        it("deve retornar false se contrato ainda não começou", () => {
            const isActive = RecurrenceScheduleCalculator.resolveIsActive({
                removedAt: null,
                startsAt: new Date("2027-01-01"),
                endsAt: null,
                today,
            });
            assert.equal(isActive, false);
        });

        it("deve retornar false se contrato já encerrou (endsAt no passado)", () => {
            const isActive = RecurrenceScheduleCalculator.resolveIsActive({
                removedAt: null,
                startsAt: new Date("2025-01-01"),
                endsAt: new Date("2026-07-31"),
                today,
            });
            assert.equal(isActive, false);
        });

        it("deve retornar true para contrato vigente", () => {
            const isActive = RecurrenceScheduleCalculator.resolveIsActive({
                removedAt: null,
                startsAt: new Date("2025-01-01"),
                endsAt: null,
                today,
            });
            assert.equal(isActive, true);
        });
    });

    describe("calculateCurrentAmount", () => {
        const today = new Date("2026-11-16T10:00:00Z");

        it("deve somar cumulativamente reajustes até a data de referência", () => {
            const amountEntries = [
                { amount: 250000, effectiveAt: new Date("2025-01-01") },
                { amount: 30000, effectiveAt: new Date("2026-01-01") },
                { amount: 20000, effectiveAt: new Date("2027-01-01") }, // futuro
            ];
            const currentAmount = RecurrenceScheduleCalculator.calculateCurrentAmount(
                amountEntries,
                today
            );
            assert.equal(currentAmount, 280000); // 250000 + 30000
        });

        it("deve retornar 0 se lista estiver vazia", () => {
            assert.equal(RecurrenceScheduleCalculator.calculateCurrentAmount([]), 0);
        });

        it("deve usar o primeiro valor se todos forem futuros", () => {
            const amountEntries = [
                { amount: 50000, effectiveAt: new Date("2027-01-01") },
            ];
            const currentAmount = RecurrenceScheduleCalculator.calculateCurrentAmount(
                amountEntries,
                today
            );
            assert.equal(currentAmount, 50000);
        });
    });

    describe("resolveActiveRule", () => {
        const today = new Date("2026-11-16T10:00:00Z");

        it("deve retornar a regra vigente com effectiveFrom mais recente <= today", () => {
            const rules = [
                { dueDay: 10, dueMonth: null, effectiveFrom: new Date("2025-01-01") },
                { dueDay: 5, dueMonth: null, effectiveFrom: new Date("2026-05-01") },
                { dueDay: 8, dueMonth: null, effectiveFrom: new Date("2026-12-01") }, // futuro
            ];
            const active = RecurrenceScheduleCalculator.resolveActiveRule(rules, today);
            assert.equal(active.dueDay, 5);
        });
    });

    describe("calculateNextDueDate", () => {
        const today = new Date("2026-11-16T12:00:00Z"); // Uma segunda-feira (16/11/2026)

        it("deve calcular próxima data para frequência SEMANAL", () => {
            // Sexta-feira = dia 5
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "WEEKLY",
                dueDay: 5,
                startsAt: new Date("2025-01-01"),
                today,
            });
            // Próxima sexta-feira após 16/11/2026 é 20/11/2026
            assert.equal(nextDate, "2026-11-20");
        });

        it("deve retornar hoje se o dia da semana coincidir com hoje", () => {
            // Segunda-feira = dia 1
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "WEEKLY",
                dueDay: 1,
                startsAt: new Date("2025-01-01"),
                today,
            });
            assert.equal(nextDate, "2026-11-16");
        });

        it("deve calcular próxima data para frequência MENSAL no mês corrente se dia >= hoje", () => {
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "MONTHLY",
                dueDay: 25,
                startsAt: new Date("2025-01-01"),
                today,
            });
            assert.equal(nextDate, "2026-11-25");
        });

        it("deve calcular próxima data para frequência MENSAL no mês seguinte se dia < hoje", () => {
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "MONTHLY",
                dueDay: 5,
                startsAt: new Date("2025-01-01"),
                today,
            });
            assert.equal(nextDate, "2026-12-05");
        });

        it("deve respeitar clamping de dias no final do mês (ex.: dia 31 em fevereiro)", () => {
            const febRef = new Date("2026-02-01T12:00:00Z");
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "MONTHLY",
                dueDay: 31,
                startsAt: new Date("2025-01-01"),
                today: febRef,
            });
            // 2026 não é bissexto -> 28 dias em fevereiro
            assert.equal(nextDate, "2026-02-28");
        });

        it("deve calcular próxima data para frequência ANUAL", () => {
            // 15 de dezembro (mês 12) ainda não passou em 16/11/2026
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "YEARLY",
                dueDay: 15,
                dueMonth: 12,
                startsAt: new Date("2025-01-01"),
                today,
            });
            assert.equal(nextDate, "2026-12-15");
        });

        it("deve calcular próxima data para frequência ANUAL no próximo ano se data já passou", () => {
            // 20 de janeiro (mês 1) já passou em 16/11/2026
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "YEARLY",
                dueDay: 20,
                dueMonth: 1,
                startsAt: new Date("2025-01-01"),
                today,
            });
            assert.equal(nextDate, "2027-01-20");
        });

        it("deve retornar null se a próxima data calculada for posterior a endsAt", () => {
            const nextDate = RecurrenceScheduleCalculator.calculateNextDueDate({
                frequency: "MONTHLY",
                dueDay: 25,
                startsAt: new Date("2025-01-01"),
                endsAt: new Date("2026-11-20"), // encerra antes do dia 25
                today,
            });
            assert.equal(nextDate, null);
        });
    });
});

