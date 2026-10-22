import { Page } from "@/types/pagination.types";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { ArchiveCardModalProps } from "../archive-card-modal/types";
import { CardActionContext } from "../../components/card-actions-drawer";

export interface FilterContext {
    searchProps: { value: string; onValueChange: (val: string) => void };
}

export interface PaginationContext {
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
}

export interface CardOverviewProps {
    data: Page<CardSummary>;
    actionsMenuContext: CardActionContext;
    onAddClick: () => void;
    filterContext: FilterContext;
    paginationContext: PaginationContext;
    archiveContext: ArchiveCardModalProps;
}

export interface MobileCardOverviewProps {
    items: CardSummary[];
    total: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => void;
    sentinelRef: (node: HTMLDivElement | null) => void;
    actionsMenuContext: CardActionContext;
    onAddClick: () => void;
    filterContext: FilterContext;
    archiveContext: ArchiveCardModalProps;
}