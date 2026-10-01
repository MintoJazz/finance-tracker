import { Page, PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { WalletSummary } from "../schemas/wallet.schema";

export interface IWalletQueries {
    listWalletsByContextId(contextId: number, pageRequest: PageRequest, filter?: BaseFilter & { balanceType?: string }): Promise<Page<WalletSummary>>;
}