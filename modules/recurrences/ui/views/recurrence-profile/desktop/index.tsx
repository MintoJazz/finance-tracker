"use client";

import React from "react";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorView } from "@/components/error-view";
import { RecurrenceProfileCard } from "@/modules/recurrences/ui/components/recurrence-profile-card";
import { RecurrenceCycleNavigatorDesktop } from "@/modules/recurrences/ui/components/recurrence-cycle-navigator";
import { RecurrenceCycleSidebarFilter } from "@/modules/recurrences/ui/components/recurrence-cycle-filter";
import { RecurrenceCycleTable } from "@/modules/recurrences/ui/components/recurrence-cycle-table";
import { ArchiveRecurrenceModalViewDesktop } from "../../archive-recurrence-modal";
import { useRecurrenceProfileGlobalActions } from "../hooks/use-recurrence-profile-global-actions";
import type { RecurrenceProfileDesktopProps } from "../types";

export function RecurrenceProfileDesktopView({
    profile,
    isLoadingProfile,
    profileError,
    horizon,
    cycles,
    isLoadingCycles,
    cyclesError,
    filters,
    activeFilterBadges,
    dateRange,
    applyFilters,
    onSelectDateRange,
    onResetDateRange,
    onPrevHorizon,
    onNextHorizon,
    clearFilters,
    isVisible,
    setIsVisible,
    actionContext,
    onAdjustAmount,
    onAdjustDeadlines,
    onEditRecurrence,
    onToggleActiveRecurrence,
    onArchiveRecurrence,
    archiveContext,
}: RecurrenceProfileDesktopProps) {
    useRecurrenceProfileGlobalActions(profile, {
        onEdit: onEditRecurrence,
        onAdjustAmount,
        onAdjustDeadlines,
        onToggleActive: onToggleActiveRecurrence,
        onArchive: onArchiveRecurrence,
    });

    if (profileError) {
        return (
            <ErrorView
                title="Erro ao carregar recorrência"
                error={profileError}
            />
        );
    }

    return (
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col gap-5 p-4 md:p-6 lg:p-8 lg:py-2 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] xl:grid-cols-[minmax(0,1fr)_310px] items-start gap-6 w-full min-w-0">
                {/* Coluna Principal: Navegador de Macro-Horizonte e Listagem Direta de Ciclos */}
                <main className="min-w-0 w-full flex flex-col gap-3.5">
                    {/* 1. Navegador de Macro-Horizonte */}
                    <RecurrenceCycleNavigatorDesktop
                        horizon={horizon}
                        onPrev={() => onPrevHorizon(horizon)}
                        onNext={() => onNextHorizon(horizon)}
                        isLoading={isLoadingCycles}
                        dateRange={dateRange}
                        onSelectDateRange={onSelectDateRange}
                        onResetDateRange={onResetDateRange}
                    />

                    {cyclesError && (
                        <div className="my-1">
                            <ErrorView
                                title="Erro ao carregar ciclos"
                                error={cyclesError}
                            />
                        </div>
                    )}

                    {/* 2. Listagem Direta de Ciclos */}
                    <div className="min-w-0 w-full flex flex-col gap-3 mt-1">
                        {/* Badges de Filtros Ativos (quando houver) */}
                        {activeFilterBadges.length > 0 && (
                            <div className="w-full mb-1">
                                <FilterBadgesCarousel
                                    items={activeFilterBadges}
                                    onClearAll={clearFilters}
                                />
                            </div>
                        )}

                        {/* Tabela de Ciclos */}
                        <RecurrenceCycleTable
                            cycles={cycles}
                            actionContext={actionContext}
                            hasFilters={activeFilterBadges.length > 0}
                            onClearFilters={clearFilters}
                            isLoading={isLoadingCycles}
                        />
                    </div>
                </main>

                {/* Coluna Lateral: Sticky Sidebar com Perfil + Filtros */}
                <aside className="w-full flex flex-col gap-5 lg:sticky lg:top-6 min-w-0">
                    {isLoadingProfile || !profile ? (
                        <Card className="w-full animate-pulse h-80 bg-muted/40">
                            <CardContent className="p-6" />
                        </Card>
                    ) : (
                        <div className="flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                            <RecurrenceProfileCard
                                recurrence={profile}
                                isVisible={isVisible}
                                onToggleVisibility={() => setIsVisible((v) => !v)}
                                className="border-0 shadow-none rounded-none"
                            />

                            <div className="border-t border-border/40 mx-4 sm:mx-4.5" />

                            <div className="px-4 sm:px-4.5 pb-4 pt-3">
                                <RecurrenceCycleSidebarFilter
                                    filters={filters}
                                    onApply={applyFilters}
                                    onClear={clearFilters}
                                />
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            <ArchiveRecurrenceModalViewDesktop {...archiveContext} />
        </div>
    );
}

export default RecurrenceProfileDesktopView;
