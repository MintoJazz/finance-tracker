import type { FilterBadgeOption } from "@/components/filter-badges-carousel";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import type { Page } from "@/types/pagination.types";
import type { RecurrenceActionContext } from "../../components/recurrence-actions-drawer";
import type { RecurrenceFilterValues } from "../../components/recurrence-filter";
import type { RecurrenceFilterBadgeKey } from "../../hooks/use-recurrence-filters";

export interface RecurrencePaginationContext {
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
}

export interface RecurrenceOverviewSharedProps {
    actionsMenuContext: RecurrenceActionContext;
    onAddClick: () => void;
    filters: RecurrenceFilterValues;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<RecurrenceFilterBadgeKey>[];
    applyFilters: (newFilters: Partial<RecurrenceFilterValues>) => void;
    clearFilters: () => void;
    clearAllFilters: () => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (open: boolean) => void;
}

export interface RecurrenceOverviewProps extends RecurrenceOverviewSharedProps {
    data: Page<RecurrenceListItem>;
    paginationContext: RecurrencePaginationContext;
}

export interface MobileRecurrenceOverviewProps
    extends RecurrenceOverviewSharedProps {
    items: RecurrenceListItem[];
    total: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => void;
    sentinelRef: (node: HTMLDivElement | null) => void;
}

