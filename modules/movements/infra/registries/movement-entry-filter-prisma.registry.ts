import { MovementWhereInput } from "@/prisma/generated/prisma/models";
import {
    MovementEntryScope,
    MovementEntryType,
} from "@/modules/movements/models/movement-entry.schema";

export type MovementWhereConditionFactory = (balanceId: number) => MovementWhereInput;

/**
 * Registry de Infraestrutura Prisma:
 * Mapeia cada tipo semântico em cláusulas exatas do Prisma combinando:
 * - Tipo do Lançamento (entry.type)
 * - Direção contábil do saldo (direction)
 * - Tipo de saldo da contraparte (entry.movements.some com balanceId != balanceIdAtual)
 */
export class MovementEntryFilterPrismaRegistry {
    private static readonly SCOPED_FACTORIES: Record<
        MovementEntryScope,
        Partial<Record<MovementEntryType, MovementWhereConditionFactory>>
    > = {
        WALLET: {
            INCOME: () => ({
                direction: "CREDIT",
                entry: {
                    type: { in: ["DIRECT", "ACCRUAL", "CLAIM_OPENING"] },
                },
            }),
            EXPENSE: (balanceId) => ({
                direction: "DEBIT",
                entry: {
                    type: { in: ["DIRECT", "ACCRUAL"] },
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: { balanceType: "CATEGORY" },
                        },
                    },
                },
            }),
            TRANSFER: (balanceId) => ({
                entry: {
                    type: "TRANSFER",
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: { balanceType: { in: ["WALLET", "RESERVE"] } },
                        },
                    },
                },
            }),
            SETTLEMENT: (balanceId) => ({
                entry: {
                    type: { in: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] },
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: {
                                balanceType: { in: ["CREDIT", "PAYABLE", "RECEIVABLE"] },
                            },
                        },
                    },
                },
            }),
            ADJUSTMENT: () => ({
                entry: { type: "ADJUSTMENT" },
            }),
            REVERSAL: () => ({
                entry: { type: "REVERSAL" },
            }),
        },

        CARD: {
            PURCHASE: (balanceId) => ({
                direction: "DEBIT",
                entry: {
                    type: { in: ["DIRECT", "ACCRUAL"] },
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: { balanceType: "CATEGORY" },
                        },
                    },
                },
            }),
            SETTLEMENT: (balanceId) => ({
                direction: "CREDIT",
                entry: {
                    type: "SETTLEMENT",
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: {
                                balanceType: { in: ["WALLET", "RESERVE"] },
                            },
                        },
                    },
                },
            }),
            ADJUSTMENT: () => ({
                entry: { type: "ADJUSTMENT" },
            }),
            REVERSAL: () => ({
                entry: { type: "REVERSAL" },
            }),
        },

        CONTRACT_CYCLE: {
            PROVISION: (balanceId) => ({
                entry: {
                    type: { in: ["ACCRUAL", "CLAIM_OPENING", "DIRECT"] },
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: { balanceType: "CATEGORY" },
                        },
                    },
                },
            }),
            SETTLEMENT: (balanceId) => ({
                entry: {
                    type: { in: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] },
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: {
                                balanceType: { in: ["WALLET", "RESERVE", "CREDIT"] },
                            },
                        },
                    },
                },
            }),
            TRANSFER: (balanceId) => ({
                entry: {
                    type: "TRANSFER",
                    movements: {
                        some: {
                            balanceId: { not: balanceId },
                            balance: { balanceType: { in: ["PAYABLE", "RECEIVABLE"] } },
                        },
                    },
                },
            }),
            ADJUSTMENT: () => ({
                entry: { type: "ADJUSTMENT" },
            }),
            REVERSAL: () => ({
                entry: { type: "REVERSAL" },
            }),
        },
    };

    /**
     * Retorna a condição Prisma única para uma conta, escopo e tipo.
     */
    static toWhereCondition(
        balanceId: number,
        scope: MovementEntryScope,
        type: MovementEntryType
    ): MovementWhereInput | null {
        const factory = this.SCOPED_FACTORIES[scope]?.[type];
        return factory ? factory(balanceId) : null;
    }

    /**
     * Retorna a lista de condições Prisma para múltiplos tipos selecionados (combinados com OR).
     */
    static toWhereConditions(
        balanceId: number,
        scope: MovementEntryScope,
        types: readonly MovementEntryType[]
    ): MovementWhereInput[] {
        const conditions: MovementWhereInput[] = [];
        for (const type of types) {
            const cond = this.toWhereCondition(balanceId, scope, type);
            if (cond) {
                conditions.push(cond);
            }
        }
        return conditions;
    }

    /**
     * Retorna os tipos suportados por determinado escopo.
     */
    static getAllowedTypes(scope: MovementEntryScope): MovementEntryType[] {
        const scopeFactories = this.SCOPED_FACTORIES[scope];
        return scopeFactories
            ? (Object.keys(scopeFactories) as MovementEntryType[])
            : [];
    }
}

