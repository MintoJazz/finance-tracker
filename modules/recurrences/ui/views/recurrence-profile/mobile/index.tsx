"use client";

import React from "react";
import { ErrorView } from "@/components/error-view";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBadgesCarousel } from "@/components/filter-badges-carousel";
import { RecurrenceCycleNavigatorMobile } from "@/modules/recurrences/ui/components/recurrence-cycle-navigator";
import { RecurrenceCycleList } from "@/modules/recurrences/ui/components/recurrence-cycle-list";
import { RecurrenceProfileCard } from "@/modules/recurrences/ui/components/recurrence-profile-card";
import { RecurrenceCycleFilterDrawer } from "@/modules/recurrences/ui/components/recurrence-cycle-filter/drawer";
import { useRecurrenceProfileGlobalActions } from "../hooks/use-recurrence-profile-global-actions";
import { ArchiveRecurrenceModalViewMobile } from "../../archive-recurrence-modal";
import type { RecurrenceProfileMobileProps } from "../types";

export default function RecurrenceProfileViewMobile({
    profile,
    isLoadingProfile,
    profileError,
    horizon,
    cycles,
    isLoadingCycles,
    cyclesError,
    filters,
    activeFilterCount,
    hasAnyFilter,
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
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    onEditRecurrence,
    onAdjustAmount,
    onAdjustDeadlines,
    onToggleActiveRecurrence,
    onArchiveRecurrence,
    archiveContext,
    onSelectCycle,
}: RecurrenceProfileMobileProps) {
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
        <div className="w-full flex flex-col divide-y divide-border/60 pb-12">
            {/* 1. Header do Perfil da Recorrência (Compacto Mobile) */}
            <div className="w-full">
                {isLoadingProfile || !profile ? (
                    <div className="p-4">
                        <Card className="w-full animate-pulse h-48 bg-muted/40">
                            <CardContent className="p-6" />
                        </Card>
                    </div>
                ) : (
                    <RecurrenceProfileCard
                        recurrence={profile}
                        isVisible={isVisible}
                        onToggleVisibility={() => setIsVisible((v) => !v)}
                        className="rounded-none border-0 shadow-none pb-3"
                    />
                )}
            </div>

            {/* 2. Navegador de Macro-Horizonte com Botão de Filtros (Full-Bleed) */}
            <div className="w-full">
                <RecurrenceCycleNavigatorMobile
                    horizon={horizon}
                    onPrev={() => onPrevHorizon(horizon)}
                    onNext={() => onNextHorizon(horizon)}
                    isLoading={isLoadingCycles}
                    dateRange={dateRange}
                    onSelectDateRange={onSelectDateRange}
                    onResetDateRange={onResetDateRange}
                    onOpenFilters={() => setIsFilterDrawerOpen(true)}
                    activeFilterCount={activeFilterCount}
                />
            </div>

            {/* Erro de Ciclos (se houver) */}
            {cyclesError && (
                <div className="p-4">
                    <ErrorView
                        title="Erro ao carregar ciclos"
                        error={cyclesError}
                    />
                </div>
            )}

            {/* 3. Badges de Filtros Ativos (se houver) */}
            {activeFilterBadges.length > 0 && (
                <div className="w-full px-4 py-2.5">
                    <FilterBadgesCarousel
                        items={activeFilterBadges}
                        onClearAll={clearFilters}
                    />
                </div>
            )}

            {/* 4. Lista de Ciclos Full-Bleed */}
            <div className="w-full">
                <RecurrenceCycleList
                    cycles={cycles}
                    actionContext={actionContext}
                    hasFilters={hasAnyFilter}
                    onClearFilters={clearFilters}
                    onSelectCycle={onSelectCycle}
                />
            </div>

            {/* Drawer de Filtros de Ciclo Mobile */}
            <RecurrenceCycleFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            />

            <ArchiveRecurrenceModalViewMobile {...archiveContext} />
        </div>
    );
}
