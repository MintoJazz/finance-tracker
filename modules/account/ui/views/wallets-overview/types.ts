import { Page } from "@/types/pagination.types";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { ArchiveWalletModalProps } from "../archive-wallet-modal/types";
import { WalletActionContext } from "../../components/wallet-actions-drawer";

export interface FilterContext {
    searchProps: { value: string; onValueChange: (val: string) => void };
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
    archiveContext: ArchiveWalletModalProps;
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
    archiveContext: ArchiveWalletModalProps;
}