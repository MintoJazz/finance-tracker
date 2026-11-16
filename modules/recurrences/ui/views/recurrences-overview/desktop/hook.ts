"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import type { Page } from "@/types/pagination.types";
import { useRecurrenceOverviewShared } from "../shared";
import type { RecurrenceOverviewProps } from "../types";

const DEFAULT_PAGE_SIZE = 10;

export function useRecurrenceOverview(
    rawData: RecurrenceListItem[]
): RecurrenceOverviewProps {
    const searchParams = useSearchParams();
    const { paginationContext } = usePaginationQueryParams();
    const shared = useRecurrenceOverviewShared(rawData);

    const data = useMemo<Page<RecurrenceListItem>>(() => {
        const rawPage = Number(searchParams.get("page") ?? "1");
        const rawPageSize = Number(
            searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)
        );

        const pageSize =
            Number.isFinite(rawPageSize) && rawPageSize > 0
                ? Math.floor(rawPageSize)
                : DEFAULT_PAGE_SIZE;
        const total = shared.filteredItems.length;
        const pageCount = Math.max(1, Math.ceil(total / pageSize));
        const parsedPage =
            Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const pageIndex = Math.min(Math.max(0, parsedPage - 1), pageCount - 1);

        const start = pageIndex * pageSize;
        const pagedItems = shared.filteredItems.slice(start, start + pageSize);

        return {
            data: pagedItems,
            total,
            pageIndex,
            pageSize,
            pageCount,
        };
    }, [searchParams, shared.filteredItems]);

    return {
        data,
        paginationContext,
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

