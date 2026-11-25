"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import type { Page } from "@/types/pagination.types";
import { useInstallmentOverviewShared } from "../shared";
import type { InstallmentOverviewProps } from "../types";

const DEFAULT_PAGE_SIZE = 10;

export function useInstallmentOverview(
    rawData: InstallmentListItem[]
): InstallmentOverviewProps {
    const searchParams = useSearchParams();
    const { paginationContext } = usePaginationQueryParams();
    const shared = useInstallmentOverviewShared(rawData);

    const data = useMemo<Page<InstallmentListItem>>(() => {
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

        return {
            data: shared.filteredItems.slice(start, start + pageSize),
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
