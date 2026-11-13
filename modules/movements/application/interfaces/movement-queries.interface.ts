import { Page, PageRequest } from "@/types/pagination.types";
import {
    WalletMovement,
    WalletMovementFilters,
} from "@/modules/movements/models/wallet-movement.schema";
import {
    MovementEntry,
    MovementEntryFilters,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";

export interface ListBalanceMovementEntriesOptions {
    ignoreDateFilter?: boolean;
}

export interface IMovementQueries {
    listBalanceMovementEntries(
        balanceId: number,
        scope: MovementEntryScope,
        pageRequest: PageRequest,
        filter?: MovementEntryFilters,
        options?: ListBalanceMovementEntriesOptions
    ): Promise<Page<MovementEntry>>;

    listWalletMovements(
        walletId: number,
        pageRequest: PageRequest,
        filter?: WalletMovementFilters
    ): Promise<Page<WalletMovement>>;

    listWalletMovementEntries(
        walletId: number,
        pageRequest: PageRequest,
        filter?: WalletMovementFilters
    ): Promise<Page<MovementEntry>>;
}