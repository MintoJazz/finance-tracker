import type { FilterBadgeOption } from "@/components/filter-badges-carousel";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import type { Page } from "@/types/pagination.types";
import type { InstallmentActionContext } from "../../components/installment-actions-drawer";
import type { InstallmentFilterValues } from "../../components/installment-filter";
import type { InstallmentFilterBadgeKey } from "../../hooks/use-installment-filters";

export interface InstallmentPaginationContext {
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
}

export interface InstallmentOverviewSharedProps {
    actionsMenuContext: InstallmentActionContext;
    onAddClick: () => void;
    filters: InstallmentFilterValues;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<InstallmentFilterBadgeKey>[];
    applyFilters: (newFilters: Partial<InstallmentFilterValues>) => void;
    clearFilters: () => void;
    clearAllFilters: () => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (open: boolean) => void;
}

export interface InstallmentOverviewProps
    extends InstallmentOverviewSharedProps {
    data: Page<InstallmentListItem>;
    paginationContext: InstallmentPaginationContext;
}

export interface MobileInstallmentOverviewProps
    extends InstallmentOverviewSharedProps {
    items: InstallmentListItem[];
    total: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => void;
    sentinelRef: (node: HTMLDivElement | null) => void;
}
