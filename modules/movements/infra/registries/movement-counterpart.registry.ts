import { BalanceType as PrismaBalanceType } from "@/prisma/generated/prisma/client";
import {
    MovementEntryCounterpart,
    MovementEntryCounterpartKind,
} from "@/modules/movements/models/movement-entry.schema";

/**
 * Tabela declarativa que mapeia o BalanceType do Prisma para o kind semântico de contraparte.
 * Zero switches / Zero ifs.
 */
export const BALANCE_TYPE_TO_COUNTERPART_KIND: Record<
    PrismaBalanceType,
    MovementEntryCounterpartKind
> = {
    CATEGORY: "CATEGORY",
    WALLET: "CUSTODY",
    RESERVE: "CUSTODY",
    CREDIT: "CARD",
    PAYABLE: "CONTRACT",
    RECEIVABLE: "CONTRACT",
    // Balance de agrupamento de parcelas: nunca recebe Movement, então não é contraparte de nada.
    INSTALLMENT: "NONE",
};

export interface MovementLegForCounterpart {
    balanceId: number;
    balance?: {
        id: number;
        name: string;
        balanceType: PrismaBalanceType;
        appearance?: {
            icon: string | null;
            color: string | null;
        } | null;
    } | null;
}

export class MovementCounterpartRegistry {
    /**
     * Resolução O(1) de contraparte via Record declarativo.
     */
    static resolveKind(
        balanceType?: PrismaBalanceType | null
    ): MovementEntryCounterpartKind {
        if (!balanceType) return "NONE";
        return BALANCE_TYPE_TO_COUNTERPART_KIND[balanceType] ?? "NONE";
    }

    /**
     * Localiza a perna oposta da transação contábil e formata a contraparte.
     */
    static resolveFromMovements(
        movements: readonly MovementLegForCounterpart[],
        targetBalanceId: number
    ): MovementEntryCounterpart {
        const counterpartLeg =
            movements.find((m) => m.balanceId !== targetBalanceId) ?? movements[0];
        const balance = counterpartLeg?.balance;
        const kind = this.resolveKind(balance?.balanceType);

        return {
            kind,
            id: balance?.id,
            name: balance?.name,
            appearance: balance?.appearance,
        };
    }
}
