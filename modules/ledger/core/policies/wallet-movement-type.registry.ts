import { EntryTypeEnum } from "../schemas/entry.schema";
import { MovementDirectionEnum } from "../schemas/movement.schema";
import { WalletMovementType } from "../schemas/wallet-movement.schema";

export interface WalletMovementTypeRule {
    entryTypes: readonly EntryTypeEnum[];
    direction?: MovementDirectionEnum;
}

/**
 * Fonte única da verdade (Domain Registry):
 * Define o que cada tipo de movimentação de carteira representa no razão contábil (Ledger).
 */
export const WALLET_MOVEMENT_TYPE_REGISTRY: Record<
    WalletMovementType,
    WalletMovementTypeRule
> = {
    INCOME: {
        entryTypes: ["DIRECT", "SETTLEMENT", "ACCRUAL"],
        direction: "CREDIT",
    },
    EXPENSE: {
        entryTypes: ["DIRECT", "SETTLEMENT", "ACCRUAL"],
        direction: "DEBIT",
    },
    TRANSFER: {
        entryTypes: ["TRANSFER"],
    },
    ADJUSTMENT: {
        entryTypes: ["ADJUSTMENT"],
    },
    REVERSAL: {
        entryTypes: ["REVERSAL"],
    },
};

/**
 * Mapeamento inverso declarativo (EntryType -> Resolução por direção ou tipo direto)
 */
const ENTRY_TYPE_TO_WALLET_MOVEMENT: Record<
    EntryTypeEnum,
    WalletMovementType | Record<MovementDirectionEnum, WalletMovementType>
> = {
    TRANSFER: "TRANSFER",
    ADJUSTMENT: "ADJUSTMENT",
    REVERSAL: "REVERSAL",
    DIRECT: { CREDIT: "INCOME", DEBIT: "EXPENSE" },
    SETTLEMENT: { CREDIT: "INCOME", DEBIT: "EXPENSE" },
    ACCRUAL: { CREDIT: "INCOME", DEBIT: "EXPENSE" },
};

export class WalletMovementTypeResolver {
    /**
     * Converte (EntryType + MovementDirection) do Ledger para WalletMovementType
     */
    static resolve(
        entryType: EntryTypeEnum,
        direction: MovementDirectionEnum
    ): WalletMovementType {
        const mapping = ENTRY_TYPE_TO_WALLET_MOVEMENT[entryType];
        if (typeof mapping === "string") {
            return mapping;
        }
        return mapping[direction];
    }

    /**
     * Retorna a regra contábil de domínio para filtrar um WalletMovementType
     */
    static getRule(type: WalletMovementType): WalletMovementTypeRule {
        return WALLET_MOVEMENT_TYPE_REGISTRY[type];
    }
}