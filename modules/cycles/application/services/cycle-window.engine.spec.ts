import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { format } from "date-fns";
import { CycleWindowEngine } from "./cycle-window.engine";
import type { CycleRuleRecord } from "./cycle-engine.registry";

describe("CycleWindowEngine", () => {
    it("normaliza colunas @db.Date (meia-noite UTC) sem deslocar -1 dia em fuso local", () => {
        const startsAtUtc = new Date("2026-11-01T00:00:00.000Z");
        const endsAtUtc = new Date("2026-12-31T00:00:00.000Z");
        const rules: CycleRuleRecord[] = [
            {
                id: 1,
                agreementId: 10,
                dueDay: 10,
                dueMonth: null,
                closingDay: null,
                closingMonth: null,
                effectiveFrom: startsAtUtc,
            },
        ];

        const windows = CycleWindowEngine.generateWindows({
            agreement: {
                frequency: "MONTHLY",
                interval: 1,
                startsAt: startsAtUtc,
                endsAt: endsAtUtc,
            },
            rules,
            window: {
                from: new Date("2026-10-01T00:00:00.000Z"),
                to: new Date("2027-01-31T00:00:00.000Z"),
            },
            anchorMode: "OVERLAP",
        });

        assert.equal(windows.length, 2);
        assert.deepEqual(windows[0].range, { from: "2026-11-01", to: "2026-11-30" });
        assert.equal(format(windows[0].dueDate, "yyyy-MM-dd"), "2026-11-10");
        assert.deepEqual(windows[1].range, { from: "2026-12-01", to: "2026-12-31" });
        assert.equal(format(windows[1].dueDate, "yyyy-MM-dd"), "2026-12-10");
    });

    it("mantém paridade do ciclo ponte quando resolveWindowForDate é chamado exatamente em endsAt", () => {
        const agreement = {
            frequency: "MONTHLY" as const,
            interval: 1,
            startsAt: new Date("2026-01-01T00:00:00.000Z"),
            endsAt: null,
        };
        const rules: CycleRuleRecord[] = [
            {
                id: 1,
                agreementId: 20,
                dueDay: 10,
                dueMonth: null,
                closingDay: 5,
                closingMonth: null,
                effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
            },
            {
                id: 2,
                agreementId: 20,
                dueDay: 25,
                dueMonth: null,
                closingDay: 20,
                closingMonth: null,
                effectiveFrom: new Date("2026-03-10T00:00:00.000Z"),
            },
        ];

        const windows = CycleWindowEngine.generateWindows({
            agreement,
            rules,
            window: {
                from: new Date("2026-02-01T00:00:00.000Z"),
                to: new Date("2026-04-30T00:00:00.000Z"),
            },
            anchorMode: "OVERLAP",
        });

        // Ciclo ponte esperado: de 06/mar (dia seguinte ao fechamento dia 5) até 20/mar (novo fechamento)
        const bridge = windows.find((w) => w.range.to === "2026-03-20");
        assert.ok(bridge, "deve gerar ciclo ponte encerrando em 2026-03-20");
        assert.equal(bridge.range.from, "2026-03-06");
        assert.equal(bridge.isBridgeCycle, true);

        // Chamar resolveWindowForDate exatamente no último dia (endsAt = 2026-03-20) deve retornar a mesma range
        const resolvedAtEnd = CycleWindowEngine.resolveWindowForDate(
            new Date("2026-03-20T00:00:00.000Z"),
            agreement,
            rules
        );
        assert.ok(resolvedAtEnd);
        assert.deepEqual(resolvedAtEnd.range, bridge.range);
        assert.equal(resolvedAtEnd.isBridgeCycle, true);
    });
});
