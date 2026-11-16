"use client";

import { useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import type { Page } from "@/types/pagination.types";
import { useRecurrenceOverviewShared } from "../shared";
import type { MobileRecurrenceOverviewProps } from "../types";

const MOBILE_PAGE_SIZE = 10;

export function useMobileRecurrenceOverview(
    rawData: RecurrenceListItem[]
): MobileRecurrenceOverviewProps {
    const shared = useRecurrenceOverviewShared(rawData);

    const initialPage = useMemo<Page<RecurrenceListItem>>(() => {
        const total = shared.filteredItems.length;
        const pageCount = Math.max(1, Math.ceil(total / MOBILE_PAGE_SIZE));

        return {
            data: shared.filteredItems.slice(0, MOBILE_PAGE_SIZE),
            total,
            pageIndex: 0,
            pageSize: MOBILE_PAGE_SIZE,
            pageCount,
        };
    }, [shared.filteredItems]);

    const { items, total, hasMore, isLoadingMore, loadMore, sentinelRef } =
        useInfiniteScroll({
            data: initialPage,
            fetchNextPage: async ({ page, pageSize }) => {
                const start = (page - 1) * pageSize;
                const nextItems = shared.filteredItems.slice(
                    start,
                    start + pageSize
                );

                return {
                    data: nextItems,
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

