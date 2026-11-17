import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    RecurrenceFormSchema,
    RecurrenceMainStepSchema,
    type RecurrenceFormValues,
} from "./recurrence-form.schema";

const base: RecurrenceFormValues = {
    direction: "DEBIT",
    name: "Aluguel",
    amount: 150000,
    frequency: "MONTHLY",
    startDate: "2026-11-17",
    hasCustomClosingDate: false,
    dueDay: 10,
    closingDay: 5,
    dueMonth: 11,
    closingMonth: 11,
    categoryId: 1,
    newCategory: null,
    subcategoryId: 11,
    newSubcategory: null,
};

const draft = (name: string) => ({ name, color: "#06B6D4", icon: "Tag" });

const parse = (patch: Partial<RecurrenceFormValues>) =>
    RecurrenceFormSchema.safeParse({ ...base, ...patch });

describe("RecurrenceFormSchema", () => {
    it("aceita recorrência mensal válida", () => {
        assert.equal(parse({}).success, true);
    });

    it("rejeita nome vazio", () => {
        assert.equal(parse({ name: "  " }).success, false);
    });

    it("mensal: rejeita dia de vencimento fora de 1–31", () => {
        assert.equal(parse({ dueDay: 0 }).success, false);
        assert.equal(parse({ dueDay: 32 }).success, false);
    });

    it("mensal: exige dia de fechamento válido quando customizado", () => {
        assert.equal(
            parse({ hasCustomClosingDate: true, closingDay: null }).success,
            false
        );
        assert.equal(
            parse({ hasCustomClosingDate: true, closingDay: 5 }).success,
            true
        );
    });

    it("semanal: aceita 0–6 e rejeita fora disso", () => {
        assert.equal(parse({ frequency: "WEEKLY", dueDay: 0 }).success, true);
        assert.equal(parse({ frequency: "WEEKLY", dueDay: 10 }).success, false);
    });

    it("anual: exige dia e mês", () => {
        assert.equal(parse({ frequency: "YEARLY", dueMonth: null }).success, false);
        assert.equal(parse({ frequency: "YEARLY" }).success, true);
    });

    it("exige data de início válida", () => {
        assert.equal(parse({ startDate: "" }).success, false);
        assert.equal(parse({ startDate: "17/11/2026" }).success, false);
        assert.equal(
            RecurrenceFormSchema.safeParse({ ...base, startDate: null }).success,
            false
        );
    });

    describe("classificação (a subcategoria é o dado de fato)", () => {
        it("exige subcategoria", () => {
            assert.equal(parse({ subcategoryId: null }).success, false);
        });

        it("aceita subcategoria existente sem categoria (categoria é só filtro)", () => {
            assert.equal(parse({ categoryId: null }).success, true);
        });

        it("rejeita subcategoria existente e nova ao mesmo tempo", () => {
            assert.equal(parse({ newSubcategory: draft("Aluguel") }).success, false);
        });

        it("subcategoria nova exige um pai", () => {
            const patch = { subcategoryId: null, newSubcategory: draft("Aluguel") };
            assert.equal(parse({ ...patch, categoryId: null }).success, false);
            assert.equal(parse({ ...patch, categoryId: 1 }).success, true);
            assert.equal(
                parse({ ...patch, categoryId: null, newCategory: draft("Moradia") }).success,
                true
            );
        });

        it("categoria nova exige subcategoria nova", () => {
            assert.equal(
                parse({ categoryId: null, newCategory: draft("Moradia") }).success,
                false
            );
        });

        it("exige nome na subcategoria nova, mas o passo principal aceita o rascunho vazio", () => {
            const patch = {
                categoryId: null,
                newCategory: draft("Moradia"),
                subcategoryId: null,
                newSubcategory: draft(""),
            };
            assert.equal(parse(patch).success, false);
            assert.equal(
                RecurrenceMainStepSchema.safeParse({ ...base, ...patch }).success,
                true
            );
        });
    });
});
