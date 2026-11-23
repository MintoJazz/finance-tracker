import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EntrySchema } from "./entry.schema";
import { MovementSchema } from "./movement.schema";
import {
    GetBalanceMovementEntriesDTOSchema,
    MovementEntryFiltersSchema,
    MovementEntrySchema,
} from "./movement-entry.schema";
import {
    GetWalletMovementsDTOSchema,
    MovementCategoryClassificationSchema,
    WalletMovementSchema,
} from "./wallet-movement.schema";

const entry = {
    id: 1,
    entryId: 10,
    date: new Date("2026-01-10"),
    description: "Mercado",
    type: "EXPENSE",
    direction: "DEBIT",
    amount: 1500,
    counterpart: { kind: "CATEGORY", id: 2, name: "Alimentação" },
};

describe("MovementSchema / EntrySchema", () => {
    it("MovementSchema aceita valores negativos (ajustes) mas exige inteiro", () => {
        const base = { entryId: 1, balanceId: 2, direction: "CREDIT" };
        assert.equal(MovementSchema.safeParse({ ...base, amount: -100 }).success, true);
        assert.equal(MovementSchema.safeParse({ ...base, amount: 10.5 }).success, false);
        assert.equal(MovementSchema.safeParse({ ...base, amount: 1, direction: "SIDEWAYS" }).success, false);
    });

    it("EntrySchema exige descrição e tipo conhecido", () => {
        const base = { description: "Aluguel", dueDate: new Date(), type: "DIRECT" };
        assert.equal(EntrySchema.safeParse(base).success, true);
        assert.equal(EntrySchema.safeParse({ ...base, description: "" }).success, false);
        assert.equal(EntrySchema.safeParse({ ...base, type: "OTHER" }).success, false);
        assert.equal(EntrySchema.safeParse({ ...base, reversesEntryId: null }).success, true);
        assert.equal(EntrySchema.safeParse({ ...base, reversesEntryId: 0 }).success, false);
    });
});

describe("MovementEntrySchema", () => {
    it("aceita um lançamento válido e aplica defaults de flags", () => {
        const parsed = MovementEntrySchema.parse(entry);
        assert.equal(parsed.isReversed, false);
        assert.equal(parsed.hasAttachment, false);
    });
    it("aceita id string ou número e data string ou Date", () => {
        assert.equal(MovementEntrySchema.safeParse({ ...entry, id: "abc", date: "2026-01-10" }).success, true);
    });
    it("valor limite do amount: 0 aceito, -1 e decimal rejeitados", () => {
        assert.equal(MovementEntrySchema.safeParse({ ...entry, amount: 0 }).success, true);
        assert.equal(MovementEntrySchema.safeParse({ ...entry, amount: -1 }).success, false);
        assert.equal(MovementEntrySchema.safeParse({ ...entry, amount: 1.5 }).success, false);
    });
    it("rejeita descrição vazia, tipo inválido e contraparte desconhecida", () => {
        assert.equal(MovementEntrySchema.safeParse({ ...entry, description: "" }).success, false);
        assert.equal(MovementEntrySchema.safeParse({ ...entry, type: "GIFT" }).success, false);
        assert.equal(MovementEntrySchema.safeParse({ ...entry, counterpart: { kind: "BANK" } }).success, false);
    });
    it("aceita contraparte NONE sem id", () => {
        assert.equal(MovementEntrySchema.safeParse({ ...entry, counterpart: { kind: "NONE" } }).success, true);
    });
});

describe("MovementEntryFiltersSchema e GetBalanceMovementEntriesDTOSchema", () => {
    it("includeReversed assume false por padrão", () => {
        assert.equal(MovementEntryFiltersSchema.parse({}).includeReversed, false);
    });
    it("DTO aplica paginação padrão 1/10 quando ausente", () => {
        const dto = GetBalanceMovementEntriesDTOSchema.parse({ balanceId: 5 });
        assert.deepEqual(dto.pageRequest, { page: 1, pageSize: 10 });
    });
    it("DTO preenche defaults parciais da página", () => {
        const dto = GetBalanceMovementEntriesDTOSchema.parse({ balanceId: 5, pageRequest: { page: 3 } });
        assert.deepEqual(dto.pageRequest, { page: 3, pageSize: 10 });
    });
    it("DTO rejeita balanceId 0 e página 0", () => {
        assert.equal(GetBalanceMovementEntriesDTOSchema.safeParse({ balanceId: 0 }).success, false);
        assert.equal(
            GetBalanceMovementEntriesDTOSchema.safeParse({ balanceId: 1, pageRequest: { page: 0 } }).success,
            false
        );
    });
});

describe("Schemas de carteira", () => {
    it("GetWalletMovementsDTOSchema converte página e tamanho vindos como string", () => {
        const dto = GetWalletMovementsDTOSchema.parse({ walletId: 2, pageRequest: { page: "2", pageSize: "25" } });
        assert.deepEqual(dto.pageRequest, { page: 2, pageSize: 25 });
    });
    it("GetWalletMovementsDTOSchema rejeita walletId inválido", () => {
        const result = GetWalletMovementsDTOSchema.safeParse({ walletId: 0, pageRequest: {} });
        assert.equal(result.success, false);
        assert.match(result.error!.issues[0].message, /inválido/i);
    });
    it("WalletMovementSchema exige descrição e valor inteiro não negativo", () => {
        const base = {
            movementId: 1,
            entryId: 1,
            description: "Salário",
            date: new Date(),
            type: "INCOME",
            direction: "CREDIT",
            amount: 100,
            isReversed: false,
            hasReceipt: true,
        };
        assert.equal(WalletMovementSchema.safeParse(base).success, true);
        assert.equal(WalletMovementSchema.safeParse({ ...base, description: "" }).success, false);
        assert.equal(WalletMovementSchema.safeParse({ ...base, amount: -1 }).success, false);
    });
    it("MovementCategoryClassificationSchema é uma união discriminada por kind", () => {
        const ok = (v: unknown) => MovementCategoryClassificationSchema.safeParse(v).success;
        assert.equal(ok({ kind: "category", category: { id: 1, name: "Casa" } }), true);
        assert.equal(ok({ kind: "multiple" }), true);
        assert.equal(ok({ kind: "pass-through" }), true);
        assert.equal(ok({ kind: "none" }), true);
        assert.equal(ok({ kind: "credit-settlement" }), true);
        assert.equal(ok({ kind: "credit-settlement", creditCard: { id: 1, name: "Nubank" } }), true);
        assert.equal(ok({ kind: "category" }), false);
        assert.equal(ok({ kind: "unknown" }), false);
    });
});
