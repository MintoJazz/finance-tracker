"use client";

import { Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { RecurrenceFilter } from "../../../components/recurrence-filter";
import { RecurrenceFilterDrawer } from "../../../components/recurrence-filter/drawer";
import { RecurrenceSearchBar } from "../../../components/recurrence-filter/search-bar";
import RecurrenceList from "../../../components/recurrence-list";
import type { MobileRecurrenceOverviewProps } from "../types";

export default function RecurrencesOverviewViewMobile({
    items,
    total,
    hasMore,
    isLoadingMore,
    sentinelRef,
    actionsMenuContext,
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
    return (
        <div className="flex w-full flex-col gap-4 py-4 pb-12">
            <header className="flex items-center justify-between gap-2 px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold tracking-tight">
                        Recorrências
                    </h1>
                    <Badge variant="outline" className="tabular-nums">
                        {total}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={onAddClick} className="gap-1.5">
                        <Plus className="size-4" />
                        Nova
                    </Button>
                </div>
            </header>

            <div className="flex flex-col gap-2.5 px-4">
                <RecurrenceSearchBar
                    value={filters.q}
                    onChange={(q) => applyFilters({ q })}
                    onOpenFilters={() => setIsFilterOpen(true)}
                    activeFilterCount={activeFilterCount}
                />

                <FilterBadgesCarousel
                    items={activeFilterBadges}
                    onClearAll={clearFilters}
                />

                <div className="flex items-center justify-end">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {items.length} de {total}
                    </span>
                </div>
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
        </div>
    );
}

