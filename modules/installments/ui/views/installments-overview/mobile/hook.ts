"use client";

import { useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import type { Page } from "@/types/pagination.types";
import { useInstallmentOverviewShared } from "../shared";
import type { MobileInstallmentOverviewProps } from "../types";

const MOBILE_PAGE_SIZE = 10;

export function useMobileInstallmentOverview(
    rawData: InstallmentListItem[]
): MobileInstallmentOverviewProps {
    const shared = useInstallmentOverviewShared(rawData);

    const initialPage = useMemo<Page<InstallmentListItem>>(() => {
        const total = shared.filteredItems.length;

        return {
            data: shared.filteredItems.slice(0, MOBILE_PAGE_SIZE),
            total,
            pageIndex: 0,
            pageSize: MOBILE_PAGE_SIZE,
            pageCount: Math.max(1, Math.ceil(total / MOBILE_PAGE_SIZE)),
        };
    }, [shared.filteredItems]);

    const { items, total, hasMore, isLoadingMore, loadMore, sentinelRef } =
        useInfiniteScroll({
            data: initialPage,
            fetchNextPage: async ({ page, pageSize }) => {
                const start = (page - 1) * pageSize;

                return {
                    data: shared.filteredItems.slice(start, start + pageSize),
                    total: shared.filteredItems.length,
                    pageIndex: page - 1,
                    pageSize,
                    pageCount: Math.max(
                        1,
                        Math.ceil(shared.filteredItems.length / pageSize)
                    ),
                };
            },
        });

    return {
        items,
        total,
        hasMore,
        isLoadingMore,
        loadMore,
        sentinelRef,
        actionsMenuContext: shared.actionsMenuContext,
        archiveContext: shared.archiveContext,
        onAddClick: shared.onAddClick,
        filters: shared.filters,
        activeFilterCount: shared.activeFilterCount,
        hasAnyFilter: shared.hasAnyFilter,
        activeFilterBadges: shared.activeFilterBadges,
        applyFilters: shared.applyFilters,
        clearFilters: shared.clearFilters,
        clearAllFilters: shared.clearAllFilters,
        isFilterOpen: shared.isFilterOpen,
        setIsFilterOpen: shared.setIsFilterOpen,
    };
}
