"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useGlobalActions } from "@/components/global-actions";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { InstallmentFilter } from "../../../components/installment-filter";
import { InstallmentFilterModal } from "../../../components/installment-filter/modal";
import { InstallmentSearchBar } from "../../../components/installment-filter/search-bar";
import InstallmentTable from "../../../components/installment-table";
import { ArchiveInstallmentModalViewDesktop } from "../../archive-installment-modal";
import type { InstallmentOverviewProps } from "../types";

export default function InstallmentsOverviewViewDesktop({
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
}: InstallmentOverviewProps) {
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <InstallmentSearchBar
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

            <InstallmentTable
                {...paginationContext}
                data={data}
                actionContext={actionsMenuContext}
                hasFilters={hasAnyFilter}
                onClearFilters={clearAllFilters}
            />

            <InstallmentFilterModal
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            >
                <InstallmentFilter.Status />
                <InstallmentFilter.Type />
            </InstallmentFilterModal>

            <ArchiveInstallmentModalViewDesktop {...archiveContext} />
        </div>
    );
}
