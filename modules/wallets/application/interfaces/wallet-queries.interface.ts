import { Page, PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { WalletSummary } from "../../models/wallet.schema";
import { WalletProfile } from "../../models/wallet-profile.schema";

export interface IWalletQueries {
    listWalletsByContextId( contextId: number, pageRequest: PageRequest, filter?: BaseFilter & { balanceType?: string } ): Promise<Page<WalletSummary>>;
    findWalletById(id: number, contextId: number): Promise<{ id: number; name: string } | null>;
    findWalletProfileById(id: number, contextId: number): Promise<WalletProfile | null>;
}