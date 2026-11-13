import { EntryTypeEnum } from "@/modules/movements/models/entry.schema";
import { MovementDirectionEnum } from "@/modules/movements/models/movement.schema";
import { WalletMovementType } from "@/modules/movements/models/wallet-movement.schema";
import { MovementEntryTypeResolver } from "@/modules/movements/infra/registries/movement-entry-type.registry";

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
        entryTypes: ["DIRECT", "ACCRUAL", "CLAIM_OPENING"],
        direction: "CREDIT",
    },
    EXPENSE: {
        entryTypes: ["DIRECT", "ACCRUAL"],
        direction: "DEBIT",
    },
    PURCHASE: {
        entryTypes: ["DIRECT", "ACCRUAL"],
        direction: "DEBIT",
    },
    PROVISION: {
        entryTypes: ["ACCRUAL", "CLAIM_OPENING", "DIRECT"],
    },
    SETTLEMENT: {
        entryTypes: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"],
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

export class WalletMovementTypeResolver {
    /**
     * Converte (EntryType + MovementDirection) do Ledger para WalletMovementType
     * delegando para o registry contábil centralizado de infraestrutura.
     */
    static resolve(
        entryType: EntryTypeEnum,
        direction: MovementDirectionEnum
    ): WalletMovementType {
        return MovementEntryTypeResolver.resolve("WALLET", entryType, direction);
    }

    /**
     * Retorna a regra contábil de domínio para filtrar um WalletMovementType
     */
    static getRule(type: WalletMovementType): WalletMovementTypeRule {
        return WALLET_MOVEMENT_TYPE_REGISTRY[type];
    }
}
