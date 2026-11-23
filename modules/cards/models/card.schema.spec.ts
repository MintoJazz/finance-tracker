import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ArchiveCardSchema, CardFormSchema, UpdateCardSchema } from "./card.schema";

const valid = { name: "Nubank", limit: 300000, closingDay: 5, dueDay: 12 };
const parse = (overrides: Record<string, unknown>) =>
    CardFormSchema.safeParse({ ...valid, ...overrides });

describe("CardFormSchema", () => {
    it("aceita um cartão válido e remove espaços do nome", () => {
        const result = parse({ name: "  Nubank  " });
        assert.equal(result.success, true);
        assert.equal(result.data?.name, "Nubank");
    });

    describe("name (equivalência e limites: 1 a 50 caracteres)", () => {
        it("rejeita vazio e só espaços (partição inválida inferior)", () => {
            assert.equal(parse({ name: "" }).success, false);
            assert.equal(parse({ name: "   " }).success, false);
        });
        it("aceita 1 e 50 caracteres (limites exatos)", () => {
            assert.equal(parse({ name: "a" }).success, true);
            assert.equal(parse({ name: "a".repeat(50) }).success, true);
        });
        it("rejeita 51 caracteres (limite superior + 1)", () => {
            assert.equal(parse({ name: "a".repeat(51) }).success, false);
        });
    });

    describe("limit (inteiro em centavos, não negativo)", () => {
        it("aceita 0 (limite inferior) e valor positivo", () => {
            assert.equal(parse({ limit: 0 }).success, true);
            assert.equal(parse({ limit: 1 }).success, true);
        });
        it("rejeita -1, decimal e não numérico", () => {
            assert.equal(parse({ limit: -1 }).success, false);
            assert.equal(parse({ limit: 10.5 }).success, false);
            assert.equal(parse({ limit: "100" }).success, false);
        });
    });

    for (const field of ["closingDay", "dueDay"] as const) {
        describe(`${field} (inteiro de 1 a 31)`, () => {
            it("aceita 1 e 31 (limites exatos)", () => {
                assert.equal(parse({ [field]: 1 }).success, true);
                assert.equal(parse({ [field]: 31 }).success, true);
            });
            it("rejeita 0 e 32 (fora dos limites)", () => {
                assert.equal(parse({ [field]: 0 }).success, false);
                assert.equal(parse({ [field]: 32 }).success, false);
            });
            it("rejeita decimal e não numérico", () => {
                assert.equal(parse({ [field]: 5.5 }).success, false);
                assert.equal(parse({ [field]: "5" }).success, false);
            });
        });
    }
});

describe("ArchiveCardSchema / UpdateCardSchema (id)", () => {
    it("aceita id positivo e rejeita 0, negativo e decimal", () => {
        assert.equal(ArchiveCardSchema.safeParse({ id: 1 }).success, true);
        assert.equal(ArchiveCardSchema.safeParse({ id: 0 }).success, false);
        assert.equal(ArchiveCardSchema.safeParse({ id: -3 }).success, false);
        assert.equal(ArchiveCardSchema.safeParse({ id: 1.5 }).success, false);
    });
    it("UpdateCardSchema exige o id além dos campos do formulário", () => {
        assert.equal(UpdateCardSchema.safeParse({ ...valid, id: 7 }).success, true);
        assert.equal(UpdateCardSchema.safeParse(valid).success, false);
    });
});
