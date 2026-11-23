import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    RecurrenceCycleFiltersSchema,
    RecurrenceCycleStatusFilterSchema,
} from "./recurrence-cycle-filters.schema";
import {
    ArchiveRecurrenceSchema,
    RestoreRecurrenceSchema,
    SetRecurrenceActiveSchema,
} from "./recurrence-status.schema";

describe("Schemas de status da recorrência", () => {
    for (const [label, schema] of [
        ["ArchiveRecurrenceSchema", ArchiveRecurrenceSchema],
        ["RestoreRecurrenceSchema", RestoreRecurrenceSchema],
    ] as const) {
        it(`${label}: aceita id positivo e rejeita 0, negativo, decimal e ausente`, () => {
            assert.equal(schema.safeParse({ id: 1 }).success, true);
            for (const id of [0, -1, 1.5, "1"]) assert.equal(schema.safeParse({ id }).success, false, String(id));
            assert.equal(schema.safeParse({}).success, false);
        });
    }

    it("SetRecurrenceActiveSchema exige id válido e isActive booleano", () => {
        assert.equal(SetRecurrenceActiveSchema.safeParse({ id: 2, isActive: false }).success, true);
        assert.equal(SetRecurrenceActiveSchema.safeParse({ id: 2 }).success, false);
        assert.equal(SetRecurrenceActiveSchema.safeParse({ id: 2, isActive: "true" }).success, false);
        assert.equal(SetRecurrenceActiveSchema.safeParse({ id: 0, isActive: true }).success, false);
    });
});

describe("RecurrenceCycleFiltersSchema", () => {
    it("aplica os padrões: offset 0, status ALL e projetados incluídos", () => {
        assert.deepEqual(RecurrenceCycleFiltersSchema.parse({}), {
            offset: 0,
            status: "ALL",
            includeProjected: true,
        });
    });

    it("converte offset textual e aceita offsets negativos", () => {
        assert.equal(RecurrenceCycleFiltersSchema.parse({ offset: "2" }).offset, 2);
        assert.equal(RecurrenceCycleFiltersSchema.parse({ offset: "-1" }).offset, -1);
        assert.equal(RecurrenceCycleFiltersSchema.safeParse({ offset: 1.5 }).success, false);
    });

    it("aceita apenas os status ALL, OVERDUE, PENDING e PAID", () => {
        for (const status of RecurrenceCycleStatusFilterSchema.options) {
            assert.equal(RecurrenceCycleFiltersSchema.safeParse({ status }).success, true);
        }
        assert.equal(RecurrenceCycleFiltersSchema.safeParse({ status: "OPEN" }).success, false);
    });

    it("valida o formato das datas YYYY-MM-DD", () => {
        assert.equal(RecurrenceCycleFiltersSchema.safeParse({ from: "2026-01-01", to: "2026-12-31" }).success, true);
        assert.equal(RecurrenceCycleFiltersSchema.safeParse({ from: "01/01/2026" }).success, false);
        assert.equal(RecurrenceCycleFiltersSchema.safeParse({ to: "2026-1-31" }).success, false);
    });
});
