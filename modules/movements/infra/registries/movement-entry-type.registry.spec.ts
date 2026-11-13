import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    MovementEntryTypeResolver,
    SCOPED_ENTRY_TYPE_REGISTRY,
} from "./movement-entry-type.registry";

describe("MovementEntryTypeResolver", () => {
    describe("CARD Scope", () => {
        it("deve mapear DIRECT, ACCRUAL e CLAIM_OPENING para PURCHASE independentemente da direção", () => {
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "DIRECT", "DEBIT"), "PURCHASE");
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "ACCRUAL", "DEBIT"), "PURCHASE");
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "CLAIM_OPENING", "DEBIT"), "PURCHASE");
        });

        it("deve mapear SETTLEMENT, CLAIM_PAYMENT e CLAIM_RECEIPT para SETTLEMENT", () => {
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "SETTLEMENT", "CREDIT"), "SETTLEMENT");
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "CLAIM_PAYMENT", "CREDIT"), "SETTLEMENT");
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "CLAIM_RECEIPT", "CREDIT"), "SETTLEMENT");
        });

        it("deve mapear TRANSFER, ADJUSTMENT e REVERSAL diretamente", () => {
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "TRANSFER", "DEBIT"), "TRANSFER");
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "ADJUSTMENT", "CREDIT"), "ADJUSTMENT");
            assert.equal(MovementEntryTypeResolver.resolve("CARD", "REVERSAL", "CREDIT"), "REVERSAL");
        });
    });

    describe("CONTRACT_CYCLE Scope", () => {
        it("deve mapear DIRECT, ACCRUAL e CLAIM_OPENING para PROVISION", () => {
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "DIRECT", "DEBIT"), "PROVISION");
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "ACCRUAL", "DEBIT"), "PROVISION");
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "CLAIM_OPENING", "DEBIT"), "PROVISION");
        });

        it("deve mapear liquidações para SETTLEMENT", () => {
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "SETTLEMENT", "CREDIT"), "SETTLEMENT");
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "CLAIM_PAYMENT", "CREDIT"), "SETTLEMENT");
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "CLAIM_RECEIPT", "CREDIT"), "SETTLEMENT");
        });

        it("deve mapear TRANSFER, ADJUSTMENT e REVERSAL diretamente", () => {
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "TRANSFER", "DEBIT"), "TRANSFER");
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "ADJUSTMENT", "DEBIT"), "ADJUSTMENT");
            assert.equal(MovementEntryTypeResolver.resolve("CONTRACT_CYCLE", "REVERSAL", "CREDIT"), "REVERSAL");
        });
    });

    describe("WALLET Scope", () => {
        it("deve diferenciar CREDIT (INCOME) e DEBIT (EXPENSE) para DIRECT, ACCRUAL e CLAIM_OPENING", () => {
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "DIRECT", "CREDIT"), "INCOME");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "DIRECT", "DEBIT"), "EXPENSE");

            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "ACCRUAL", "CREDIT"), "INCOME");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "ACCRUAL", "DEBIT"), "EXPENSE");

            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "CLAIM_OPENING", "CREDIT"), "INCOME");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "CLAIM_OPENING", "DEBIT"), "EXPENSE");
        });

        it("deve mapear liquidações para SETTLEMENT", () => {
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "SETTLEMENT", "DEBIT"), "SETTLEMENT");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "CLAIM_PAYMENT", "DEBIT"), "SETTLEMENT");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "CLAIM_RECEIPT", "CREDIT"), "SETTLEMENT");
        });

        it("deve mapear TRANSFER, ADJUSTMENT e REVERSAL diretamente", () => {
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "TRANSFER", "DEBIT"), "TRANSFER");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "ADJUSTMENT", "CREDIT"), "ADJUSTMENT");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", "REVERSAL", "CREDIT"), "REVERSAL");
        });
    });

    describe("Exaustividade do Record", () => {
        it("deve conter todos os escopos suportados", () => {
            assert.deepEqual(Object.keys(SCOPED_ENTRY_TYPE_REGISTRY).sort(), [
                "CARD",
                "CONTRACT_CYCLE",
                "WALLET",
            ]);
        });
    });
});
