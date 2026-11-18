"use client";

import { useMemo } from "react";
import { useGlobalActions } from "@/components/global-actions";
import { Loader2, Plus } from "lucide-react";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { RecurrenceFilter } from "../../../components/recurrence-filter";
import { RecurrenceFilterDrawer } from "../../../components/recurrence-filter/drawer";
import { RecurrenceSearchBar } from "../../../components/recurrence-filter/search-bar";
import RecurrenceList from "../../../components/recurrence-list";
import { ArchiveRecurrenceModalViewMobile } from "../../archive-recurrence-modal";
import type { MobileRecurrenceOverviewProps } from "../types";

export default function RecurrencesOverviewViewMobile({
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
}: MobileRecurrenceOverviewProps) {
    const globalActions = useMemo(
        () => [
            {
                id: "recurrences-new",
                label: "Nova recorrência",
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
                <RecurrenceSearchBar
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

            <RecurrenceList
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
                            <span>Carregando mais recorrências...</span>
                        </div>
                    )}
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2 px-4">
                    Todas as recorrências foram carregadas
                </p>
            )}

            <RecurrenceFilterDrawer
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            >
                <RecurrenceFilter.Direction />
                <RecurrenceFilter.Status />
                <RecurrenceFilter.Frequency />
            </RecurrenceFilterDrawer>

            <ArchiveRecurrenceModalViewMobile {...archiveContext} />
        </div>
    );
}

