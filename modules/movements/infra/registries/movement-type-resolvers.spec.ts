import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    MovementEntryTypeResolver,
    SCOPED_ENTRY_TYPE_REGISTRY,
} from "./movement-entry-type.registry";
import { WalletMovementTypeResolver, WALLET_MOVEMENT_TYPE_REGISTRY } from "@/modules/movements/application/services/wallet-movement-type.registry";
import { EntryTypeEnumSchema } from "@/modules/movements/models/entry.schema";
import { MovementEntryTypeSchema } from "@/modules/movements/models/movement-entry.schema";

const entryTypes = EntryTypeEnumSchema.options;

describe("MovementEntryTypeResolver (tabela contábil)", () => {
    it("o registry cobre todos os EntryType nos dois escopos", () => {
        for (const scope of ["CARD", "WALLET"] as const) {
            assert.deepEqual(
                Object.keys(SCOPED_ENTRY_TYPE_REGISTRY[scope]).sort(),
                [...entryTypes].sort(),
                scope
            );
        }
    });

    it("no cartão, lançamentos de dívida viram PURCHASE independente da direção", () => {
        for (const type of ["DIRECT", "ACCRUAL", "CLAIM_OPENING"] as const) {
            for (const direction of ["CREDIT", "DEBIT"] as const) {
                assert.equal(MovementEntryTypeResolver.resolve("CARD", type, direction), "PURCHASE");
            }
        }
    });

    it("na carteira, DIRECT/ACCRUAL/CLAIM_OPENING dependem da direção", () => {
        for (const type of ["DIRECT", "ACCRUAL", "CLAIM_OPENING"] as const) {
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", type, "CREDIT"), "INCOME");
            assert.equal(MovementEntryTypeResolver.resolve("WALLET", type, "DEBIT"), "EXPENSE");
        }
    });

    it("pagamentos e recebimentos viram SETTLEMENT em ambos os escopos", () => {
        for (const scope of ["CARD", "WALLET"] as const) {
            for (const type of ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] as const) {
                assert.equal(MovementEntryTypeResolver.resolve(scope, type, "DEBIT"), "SETTLEMENT");
            }
        }
    });

    it("TRANSFER, ADJUSTMENT e REVERSAL mantêm o tipo", () => {
        for (const scope of ["CARD", "WALLET"] as const) {
            assert.equal(MovementEntryTypeResolver.resolve(scope, "TRANSFER", "CREDIT"), "TRANSFER");
            assert.equal(MovementEntryTypeResolver.resolve(scope, "ADJUSTMENT", "DEBIT"), "ADJUSTMENT");
            assert.equal(MovementEntryTypeResolver.resolve(scope, "REVERSAL", "CREDIT"), "REVERSAL");
        }
    });

    it("todo resultado é um MovementEntryType válido", () => {
        for (const scope of ["CARD", "WALLET"] as const) {
            for (const type of entryTypes) {
                for (const direction of ["CREDIT", "DEBIT"] as const) {
                    const resolved = MovementEntryTypeResolver.resolve(scope, type, direction);
                    assert.equal(MovementEntryTypeSchema.safeParse(resolved).success, true);
                }
            }
        }
    });
});

describe("WalletMovementTypeResolver", () => {
    it("delega ao registry contábil com escopo WALLET", () => {
        assert.equal(WalletMovementTypeResolver.resolve("DIRECT", "CREDIT"), "INCOME");
        assert.equal(WalletMovementTypeResolver.resolve("ACCRUAL", "DEBIT"), "EXPENSE");
        assert.equal(WalletMovementTypeResolver.resolve("CLAIM_PAYMENT", "DEBIT"), "SETTLEMENT");
    });

    it("getRule devolve a regra de cada tipo de movimentação", () => {
        for (const type of MovementEntryTypeSchema.options) {
            assert.equal(WalletMovementTypeResolver.getRule(type), WALLET_MOVEMENT_TYPE_REGISTRY[type]);
        }
        assert.equal(WalletMovementTypeResolver.getRule("INCOME").direction, "CREDIT");
        assert.equal(WalletMovementTypeResolver.getRule("EXPENSE").direction, "DEBIT");
        assert.equal(WalletMovementTypeResolver.getRule("TRANSFER").direction, undefined);
    });

    it("toda regra usa apenas EntryTypes válidos e não vazios", () => {
        for (const rule of Object.values(WALLET_MOVEMENT_TYPE_REGISTRY)) {
            assert.ok(rule.entryTypes.length > 0);
            for (const t of rule.entryTypes) assert.ok(entryTypes.includes(t));
        }
    });
});
