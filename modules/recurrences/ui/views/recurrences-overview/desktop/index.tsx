"use client";

import { useMemo } from "react";
import { useGlobalActions } from "@/components/global-actions";
import { Plus } from "lucide-react";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { RecurrenceFilter } from "../../../components/recurrence-filter";
import { RecurrenceFilterModal } from "../../../components/recurrence-filter/modal";
import { RecurrenceSearchBar } from "../../../components/recurrence-filter/search-bar";
import RecurrenceTable from "../../../components/recurrence-table";
import { ArchiveRecurrenceModalViewDesktop } from "../../archive-recurrence-modal";
import type { RecurrenceOverviewProps } from "../types";

export default function RecurrencesOverviewViewDesktop({
    data,
    actionsMenuContext,
    archiveContext,
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <RecurrenceSearchBar
                    value={filters.q}
                    onChange={(q) => applyFilters({ q })}
                    onOpenFilters={() => setIsFilterOpen(true)}
                    activeFilterCount={activeFilterCount}
                />
            </header>

            <FilterBadgesCarousel
                items={activeFilterBadges}
                onClearAll={clearFilters}
                count={{ shown: data.data.length, total: data.total }}
            />

            <RecurrenceTable
                {...paginationContext}
                data={data}
                actionContext={actionsMenuContext}
                hasFilters={hasAnyFilter}
                onClearFilters={clearAllFilters}
            />

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

            <ArchiveRecurrenceModalViewDesktop {...archiveContext} />
        </div>
    );
}

