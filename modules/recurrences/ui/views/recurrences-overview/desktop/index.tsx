"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { RecurrenceFilter } from "../../../components/recurrence-filter";
import { RecurrenceFilterModal } from "../../../components/recurrence-filter/modal";
import { RecurrenceSearchBar } from "../../../components/recurrence-filter/search-bar";
import RecurrenceTable from "../../../components/recurrence-table";
import type { RecurrenceOverviewProps } from "../types";

export default function RecurrencesOverviewViewDesktop({
    data,
    actionsMenuContext,
    onAddClick,
    paginationContext,
    filters,
    activeFilterCount,
    hasAnyFilter,
    activeFilterBadges,
    applyFilters,
    clearFilters,
    clearAllFilters,
    isFilterOpen,
    setIsFilterOpen,
}: RecurrenceOverviewProps) {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Recorrências
                    </h1>
                    <Badge variant="outline" className="tabular-nums">
                        {data.total}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={onAddClick}>
                        <Plus data-icon="inline-start" />
                        Nova recorrência
                    </Button>
                </div>
            </header>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <RecurrenceSearchBar
                        value={filters.q}
                        onChange={(q) => applyFilters({ q })}
                        onOpenFilters={() => setIsFilterOpen(true)}
                        activeFilterCount={activeFilterCount}
                        className="lg:max-w-sm"
                    />
                </div>

                <FilterBadgesCarousel
                    items={activeFilterBadges}
                    onClearAll={clearFilters}
                />
            </div>

            <RecurrenceTable
                {...paginationContext}
                data={data}
                actionContext={actionsMenuContext}
                hasFilters={hasAnyFilter}
                onClearFilters={clearAllFilters}
            />

            {data.total > 0 && (
                <p className="text-xs text-muted-foreground">
                    Mostrando {data.data.length} de {data.total} recorrências
                </p>
            )}

            <RecurrenceFilterModal
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            >
                <RecurrenceFilter.Direction />
                <RecurrenceFilter.Status />
                <RecurrenceFilter.Frequency />
            </RecurrenceFilterModal>
        </div>
    );
}

