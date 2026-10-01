import { Page } from "@/types/pagination.types";
import { WalletActionContext } from "../../config/wallet-actions-menu";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";

export interface FilterContext {
    searchProps: { value: string; onValueChange: (val: string) => void };
    showArchived: { pressed: boolean; onPressedChange: (val: boolean) => void };
}

export interface PaginationContext {
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
}

export interface WalletOverviewProps {
    data: Page<WalletSummary>;
    actionsMenuContext: WalletActionContext;
    onAddClick: () => void;
    filterContext: FilterContext;
    paginationContext: PaginationContext;
}

export interface MobileWalletOverviewProps {
    items: WalletSummary[];
    total: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => void;
    sentinelRef: (node: HTMLDivElement | null) => void;
    actionsMenuContext: WalletActionContext;
    onAddClick: () => void;
    filterContext: FilterContext;
}