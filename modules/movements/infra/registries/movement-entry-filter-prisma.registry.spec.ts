import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MovementEntryFilterPrismaRegistry } from "./movement-entry-filter-prisma.registry";
import { MovementEntryMapper } from "../mappers/movement-entry.mapper";

describe("MovementEntryFilterPrismaRegistry", () => {
    const BALANCE_ID = 10;

    describe("WALLET Scope", () => {
        it("deve gerar condição para INCOME com direção CREDIT", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "WALLET",
                "INCOME"
            );
            assert.deepEqual(cond, {
                direction: "CREDIT",
                entry: {
                    type: { in: ["DIRECT", "ACCRUAL", "CLAIM_OPENING"] },
                },
            });
        });

        it("deve gerar condição para EXPENSE excluindo balanceId atual e apontando para CATEGORY", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "WALLET",
                "EXPENSE"
            );
            assert.deepEqual(cond, {
                direction: "DEBIT",
                entry: {
                    type: { in: ["DIRECT", "ACCRUAL"] },
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: { balanceType: "CATEGORY" },
                        },
                    },
                },
            });
        });

        it("deve gerar condição para SETTLEMENT apontando para contrapartes CREDIT, PAYABLE ou RECEIVABLE", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "WALLET",
                "SETTLEMENT"
            );
            assert.deepEqual(cond, {
                entry: {
                    type: { in: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] },
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: {
                                balanceType: { in: ["CREDIT", "PAYABLE", "RECEIVABLE"] },
                            },
                        },
                    },
                },
            });
        });

        it("deve gerar condição para TRANSFER apontando para outra conta de custódia", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "WALLET",
                "TRANSFER"
            );
            assert.deepEqual(cond, {
                entry: {
                    type: "TRANSFER",
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: { balanceType: { in: ["WALLET", "RESERVE"] } },
                        },
                    },
                },
            });
        });
    });

    describe("CARD Scope", () => {
        it("deve gerar condição para PURCHASE com DEBIT e contraparte CATEGORY", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "CARD",
                "PURCHASE"
            );
            assert.deepEqual(cond, {
                direction: "DEBIT",
                entry: {
                    type: { in: ["DIRECT", "ACCRUAL"] },
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: { balanceType: "CATEGORY" },
                        },
                    },
                },
            });
        });

        it("deve gerar condição para SETTLEMENT com CREDIT e contraparte WALLET/RESERVE", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "CARD",
                "SETTLEMENT"
            );
            assert.deepEqual(cond, {
                direction: "CREDIT",
                entry: {
                    type: "SETTLEMENT",
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: {
                                balanceType: { in: ["WALLET", "RESERVE"] },
                            },
                        },
                    },
                },
            });
        });
    });

    describe("CONTRACT_CYCLE Scope", () => {
        it("deve gerar condição para PROVISION com contraparte CATEGORY", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "CONTRACT_CYCLE",
                "PROVISION"
            );
            assert.deepEqual(cond, {
                entry: {
                    type: { in: ["ACCRUAL", "CLAIM_OPENING", "DIRECT"] },
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: { balanceType: "CATEGORY" },
                        },
                    },
                },
            });
        });

        it("deve gerar condição para SETTLEMENT com contraparte WALLET/RESERVE/CREDIT", () => {
            const cond = MovementEntryFilterPrismaRegistry.toWhereCondition(
                BALANCE_ID,
                "CONTRACT_CYCLE",
                "SETTLEMENT"
            );
            assert.deepEqual(cond, {
                entry: {
                    type: { in: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] },
                    movements: {
                        some: {
                            balanceId: { not: BALANCE_ID },
                            balance: {
                                balanceType: { in: ["WALLET", "RESERVE", "CREDIT"] },
                            },
                        },
                    },
                },
            });
        });
    });

    describe("toWhereConditions", () => {
        it("deve retornar array com as cláusulas para múltiplos tipos", () => {
            const conds = MovementEntryFilterPrismaRegistry.toWhereConditions(
                BALANCE_ID,
                "CARD",
                ["PURCHASE", "SETTLEMENT"]
            );
            assert.equal(conds.length, 2);
            assert.equal(conds[0].direction, "DEBIT");
            assert.equal(conds[1].direction, "CREDIT");
        });
    });
});

describe("MovementEntryMapper.resolveMovementEntryType (Paridade com Registry)", () => {
    it("deve mapear corretamente compra no cartão como PURCHASE", () => {
        const type = MovementEntryMapper.resolveMovementEntryType(
            "CARD",
            "DEBIT",
            "DIRECT",
            "CATEGORY"
        );
        assert.equal(type, "PURCHASE");
    });

    it("deve mapear corretamente liquidação de fatura no cartão como SETTLEMENT", () => {
        const type = MovementEntryMapper.resolveMovementEntryType(
            "CARD",
            "CREDIT",
            "SETTLEMENT",
            "CUSTODY"
        );
        assert.equal(type, "SETTLEMENT");
    });

    it("deve mapear provisão de contrato como PROVISION", () => {
        const type = MovementEntryMapper.resolveMovementEntryType(
            "CONTRACT_CYCLE",
            "DEBIT",
            "ACCRUAL",
            "CATEGORY"
        );
        assert.equal(type, "PROVISION");
    });

    it("deve mapear quitação de contrato como SETTLEMENT", () => {
        const type = MovementEntryMapper.resolveMovementEntryType(
            "CONTRACT_CYCLE",
            "CREDIT",
            "SETTLEMENT",
            "CUSTODY"
        );
        assert.equal(type, "SETTLEMENT");
    });

    it("deve mapear despesa de carteira como EXPENSE", () => {
        const type = MovementEntryMapper.resolveMovementEntryType(
            "WALLET",
            "DEBIT",
            "DIRECT",
            "CATEGORY"
        );
        assert.equal(type, "EXPENSE");
    });

    it("deve mapear quitação na carteira contra cartão como SETTLEMENT", () => {
        const type = MovementEntryMapper.resolveMovementEntryType(
            "WALLET",
            "DEBIT",
            "SETTLEMENT",
            "CARD"
        );
        assert.equal(type, "SETTLEMENT");
    });
});
