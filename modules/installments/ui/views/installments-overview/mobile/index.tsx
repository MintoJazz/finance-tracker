"use client";

import { useMemo } from "react";
import { Loader2, Plus } from "lucide-react";
import { useGlobalActions } from "@/components/global-actions";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { InstallmentFilter } from "../../../components/installment-filter";
import { InstallmentFilterDrawer } from "../../../components/installment-filter/drawer";
import { InstallmentSearchBar } from "../../../components/installment-filter/search-bar";
import InstallmentList from "../../../components/installment-list";
import { ArchiveInstallmentModalViewMobile } from "../../archive-installment-modal";
import type { MobileInstallmentOverviewProps } from "../types";

export default function InstallmentsOverviewViewMobile({
    items,
    total,
    hasMore,
    isLoadingMore,
    sentinelRef,
    actionsMenuContext,
    archiveContext,
    onAddClick,
    filters,
    activeFilterCount,
    hasAnyFilter,
    activeFilterBadges,
    applyFilters,
    clearFilters,
    clearAllFilters,
    isFilterOpen,
    setIsFilterOpen,
}: MobileInstallmentOverviewProps) {
    const globalActions = useMemo(
        () => [
            {
                id: "installments-new",
                label: "Novo parcelamento",
                icon: Plus,
                onClick: onAddClick,
            },
        ],
        [onAddClick]
    );
    useGlobalActions(globalActions);

    return (
        <div className="flex w-full flex-col gap-3 py-4 pb-12">
            <div className="flex flex-col gap-3 px-4">
                <InstallmentSearchBar
                    value={filters.q}
                    onChange={(q) => applyFilters({ q })}
                    onOpenFilters={() => setIsFilterOpen(true)}
                    activeFilterCount={activeFilterCount}
                />

                <FilterBadgesCarousel
                    items={activeFilterBadges}
                    onClearAll={clearFilters}
                    count={{ shown: items.length, total }}
                />
            </div>

            <InstallmentList
                data={items}
                actionContext={actionsMenuContext}
                hasFilters={hasAnyFilter}
                onClearFilters={clearAllFilters}
            />

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="flex w-full items-center justify-center py-4 px-4"
                >
                    {isLoadingMore && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Carregando mais parcelamentos...</span>
                        </div>
                    )}
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2 px-4">
                    Todos os parcelamentos foram carregados
                </p>
            )}

            <InstallmentFilterDrawer
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            >
                <InstallmentFilter.Status />
                <InstallmentFilter.Type />
            </InstallmentFilterDrawer>

            <ArchiveInstallmentModalViewMobile {...archiveContext} />
        </div>
    );
}
