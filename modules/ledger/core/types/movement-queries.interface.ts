import { Page, PageRequest } from "@/types/pagination.types";
import {
    WalletMovement,
    WalletMovementFilters,
} from "../schemas/wallet-movement.schema";

export interface IMovementQueries {
    listWalletMovements(
        walletId: number,
        pageRequest: PageRequest,
        filter?: WalletMovementFilters
    ): Promise<Page<WalletMovement>>;
}