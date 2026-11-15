import {
    EntryType as PrismaEntryType,
    MovementDirection as PrismaMovementDirection,
} from "@/prisma/generated/prisma/client";
import {
    MovementEntryScope,
    MovementEntryType,
} from "@/modules/movements/models/movement-entry.schema";

export type MovementTypeMapping =
    | MovementEntryType
    | Record<PrismaMovementDirection, MovementEntryType>;

/**
 * Tabela da Verdade Contábil Declarativa (Zero switches / Zero ifs):
 * Mapeia (Scope -> EntryType -> MovementEntryType | { CREDIT, DEBIT }).
 */
export const SCOPED_ENTRY_TYPE_REGISTRY: Record<
    MovementEntryScope,
    Record<PrismaEntryType, MovementTypeMapping>
> = {
    CARD: {
        DIRECT: "PURCHASE",
        ACCRUAL: "PURCHASE",
        CLAIM_OPENING: "PURCHASE",
        SETTLEMENT: "SETTLEMENT",
        CLAIM_PAYMENT: "SETTLEMENT",
        CLAIM_RECEIPT: "SETTLEMENT",
        TRANSFER: "TRANSFER",
        ADJUSTMENT: "ADJUSTMENT",
        REVERSAL: "REVERSAL",
    },
    WALLET: {
        DIRECT: { CREDIT: "INCOME", DEBIT: "EXPENSE" },
        ACCRUAL: { CREDIT: "INCOME", DEBIT: "EXPENSE" },
        CLAIM_OPENING: { CREDIT: "INCOME", DEBIT: "EXPENSE" },
        SETTLEMENT: "SETTLEMENT",
        CLAIM_PAYMENT: "SETTLEMENT",
        CLAIM_RECEIPT: "SETTLEMENT",
        TRANSFER: "TRANSFER",
        ADJUSTMENT: "ADJUSTMENT",
        REVERSAL: "REVERSAL",
    },
};

export class MovementEntryTypeResolver {
    /**
     * Resolução pura em O(1) através do Record contábil.
     */
    static resolve(
        scope: MovementEntryScope,
        entryType: PrismaEntryType,
        direction: PrismaMovementDirection
    ): MovementEntryType {
        const mapping = SCOPED_ENTRY_TYPE_REGISTRY[scope][entryType];
        if (typeof mapping === "string") {
            return mapping;
        }
        return mapping[direction];
    }
}
