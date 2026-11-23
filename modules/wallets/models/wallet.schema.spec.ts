import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    ArchiveWalletSchema,
    RestoreWalletSchema,
    UpdateWalletSchema,
    WalletFormSchema,
} from "./wallet.schema";

describe("WalletFormSchema", () => {
    it("aceita um nome válido e remove espaços nas pontas", () => {
        const result = WalletFormSchema.safeParse({ name: "  Carteira  " });
        assert.equal(result.success, true);
        assert.equal(result.data?.name, "Carteira");
    });

    describe("name (equivalência e limites: 1 a 50 caracteres)", () => {
        it("rejeita vazio e só espaços (partição inválida inferior)", () => {
            assert.equal(WalletFormSchema.safeParse({ name: "" }).success, false);
            assert.equal(WalletFormSchema.safeParse({ name: "   " }).success, false);
        });
        it("aceita 1 e 50 caracteres (limites exatos)", () => {
            assert.equal(WalletFormSchema.safeParse({ name: "a" }).success, true);
            assert.equal(WalletFormSchema.safeParse({ name: "a".repeat(50) }).success, true);
        });
        it("rejeita 51 caracteres (limite superior + 1)", () => {
            assert.equal(WalletFormSchema.safeParse({ name: "a".repeat(51) }).success, false);
        });
        it("rejeita ausência e tipo errado", () => {
            assert.equal(WalletFormSchema.safeParse({}).success, false);
            assert.equal(WalletFormSchema.safeParse({ name: 10 }).success, false);
        });
    });
});

describe("UpdateWalletSchema", () => {
    it("aceita id positivo com nome válido", () => {
        assert.equal(UpdateWalletSchema.safeParse({ id: 1, name: "Poupança" }).success, true);
    });
    it("rejeita id 0, negativo e decimal", () => {
        for (const id of [0, -1, 1.5]) {
            assert.equal(UpdateWalletSchema.safeParse({ id, name: "Poupança" }).success, false);
        }
    });
    it("aplica as mesmas regras de nome do formulário", () => {
        assert.equal(UpdateWalletSchema.safeParse({ id: 1, name: " " }).success, false);
        assert.equal(UpdateWalletSchema.safeParse({ id: 1, name: "a".repeat(51) }).success, false);
        assert.equal(UpdateWalletSchema.safeParse({ id: 1, name: "a".repeat(50) }).success, true);
    });
});

describe("ArchiveWalletSchema / RestoreWalletSchema (id)", () => {
    for (const [label, schema] of [
        ["ArchiveWalletSchema", ArchiveWalletSchema],
        ["RestoreWalletSchema", RestoreWalletSchema],
    ] as const) {
        it(`${label}: aceita id positivo e rejeita 0, negativo, decimal e ausente`, () => {
            assert.equal(schema.safeParse({ id: 1 }).success, true);
            assert.equal(schema.safeParse({ id: 0 }).success, false);
            assert.equal(schema.safeParse({ id: -3 }).success, false);
            assert.equal(schema.safeParse({ id: 1.5 }).success, false);
            assert.equal(schema.safeParse({}).success, false);
        });
    }
});
