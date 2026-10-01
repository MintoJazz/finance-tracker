import { Page } from "@/types/pagination.types";
import { CardActionContext } from "../../config/card-actions-menu";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";

export interface FilterContext {
    searchProps: { value: string; onValueChange: (val: string) => void };
    showArchived: { pressed: boolean; onPressedChange: (val: boolean) => void };
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
}
