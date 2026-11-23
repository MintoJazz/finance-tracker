import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    BALANCE_TYPE_TO_COUNTERPART_KIND,
    MovementCounterpartRegistry,
} from "./movement-counterpart.registry";

describe("MovementCounterpartRegistry", () => {
    describe("resolveKind", () => {
        it("deve mapear CATEGORY para CATEGORY", () => {
            assert.equal(MovementCounterpartRegistry.resolveKind("CATEGORY"), "CATEGORY");
        });

        it("deve mapear WALLET e RESERVE para CUSTODY", () => {
            assert.equal(MovementCounterpartRegistry.resolveKind("WALLET"), "CUSTODY");
            assert.equal(MovementCounterpartRegistry.resolveKind("RESERVE"), "CUSTODY");
        });

        it("deve mapear CREDIT para CARD", () => {
            assert.equal(MovementCounterpartRegistry.resolveKind("CREDIT"), "CARD");
        });

        it("deve mapear PAYABLE e RECEIVABLE para CONTRACT", () => {
            assert.equal(MovementCounterpartRegistry.resolveKind("PAYABLE"), "CONTRACT");
            assert.equal(MovementCounterpartRegistry.resolveKind("RECEIVABLE"), "CONTRACT");
        });

        it("deve retornar NONE para nulo ou indefinido", () => {
            assert.equal(MovementCounterpartRegistry.resolveKind(null), "NONE");
            assert.equal(MovementCounterpartRegistry.resolveKind(undefined), "NONE");
        });

        it("deve conter todas as chaves de BalanceType no record declarativo", () => {
            assert.deepEqual(Object.keys(BALANCE_TYPE_TO_COUNTERPART_KIND).sort(), [
                "CATEGORY",
                "CREDIT",
                "INSTALLMENT",
                "PAYABLE",
                "RECEIVABLE",
                "RESERVE",
                "WALLET",
            ]);
        });

        it("deve mapear INSTALLMENT (parcelamento como obrigação) para CONTRACT", () => {
            assert.equal(MovementCounterpartRegistry.resolveKind("INSTALLMENT"), "CONTRACT");
        });
    });

    describe("resolveFromMovements", () => {
        const TARGET_WALLET_ID = 1;

        it("deve selecionar a perna de contraparte cujo balanceId seja diferente do targetBalanceId", () => {
            const counterpart = MovementCounterpartRegistry.resolveFromMovements(
                [
                    {
                        balanceId: TARGET_WALLET_ID,
                        balance: {
                            id: TARGET_WALLET_ID,
                            name: "Carteira Principal",
                            balanceType: "WALLET",
                        },
                    },
                    {
                        balanceId: 42,
                        balance: {
                            id: 42,
                            name: "Alimentação",
                            balanceType: "CATEGORY",
                            appearance: { icon: "utensils", color: "#FF5733" },
                        },
                    },
                ],
                TARGET_WALLET_ID
            );

            assert.equal(counterpart.kind, "CATEGORY");
            assert.equal(counterpart.id, 42);
            assert.equal(counterpart.name, "Alimentação");
            assert.deepEqual(counterpart.appearance, {
                icon: "utensils",
                color: "#FF5733",
            });
        });

        it("deve identificar contraparte de transferência como CUSTODY", () => {
            const counterpart = MovementCounterpartRegistry.resolveFromMovements(
                [
                    {
                        balanceId: TARGET_WALLET_ID,
                        balance: {
                            id: TARGET_WALLET_ID,
                            name: "Conta Corrente",
                            balanceType: "WALLET",
                        },
                    },
                    {
                        balanceId: 2,
                        balance: {
                            id: 2,
                            name: "Reserva de Emergência",
                            balanceType: "RESERVE",
                        },
                    },
                ],
                TARGET_WALLET_ID
            );

            assert.equal(counterpart.kind, "CUSTODY");
            assert.equal(counterpart.id, 2);
            assert.equal(counterpart.name, "Reserva de Emergência");
        });

        it("deve identificar contraparte de cartão de crédito como CARD", () => {
            const counterpart = MovementCounterpartRegistry.resolveFromMovements(
                [
                    {
                        balanceId: TARGET_WALLET_ID,
                        balance: {
                            id: TARGET_WALLET_ID,
                            name: "Conta Corrente",
                            balanceType: "WALLET",
                        },
                    },
                    {
                        balanceId: 99,
                        balance: {
                            id: 99,
                            name: "Cartão Nubank",
                            balanceType: "CREDIT",
                        },
                    },
                ],
                TARGET_WALLET_ID
            );

            assert.equal(counterpart.kind, "CARD");
            assert.equal(counterpart.id, 99);
            assert.equal(counterpart.name, "Cartão Nubank");
        });

        it("deve retornar kind NONE se não houver perna de contraparte ou balance", () => {
            const counterpart = MovementCounterpartRegistry.resolveFromMovements([], TARGET_WALLET_ID);
            assert.equal(counterpart.kind, "NONE");
            assert.equal(counterpart.id, undefined);
            assert.equal(counterpart.name, undefined);
        });
    });
});
