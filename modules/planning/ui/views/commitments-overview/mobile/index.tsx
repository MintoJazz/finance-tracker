"use client";

import { useState } from "react";
import {
    CalendarClock,
    Eye,
    EyeOff,
    SlidersHorizontal,
} from "lucide-react";
import { ErrorView } from "@/components/error-view";
import {
    ProfileCard,
    ProfileCardAvatar,
    ProfileCardBanner,
    ProfileCardContent,
} from "@/components/profile-card";
import { Badge } from "@/components/ui/badge";
import { InputGroupButton } from "@/components/ui/input-group";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatMoney } from "@/lib/formatters";
import { CommitmentCycleFilterDrawer } from "../../../components/commitment-cycle-filter-drawer";
import { CommitmentCycleList } from "../../../components/commitment-cycle-list";
import { CommitmentCycleSearch } from "../../../components/commitment-cycle-search";
import { CommitmentSummaryProgress } from "../../../components/commitment-summary-progress";
import { SummaryCardSkeleton } from "../../../components/skeletons/summary-card-skeleton";
import { CommitmentsOverviewMobileProps } from "../types";

function formatIsoRangeLabel(from: string, to: string): string {
    const [fy, fm, fd] = from.split("-");
    const [ty, tm, td] = to.split("-");
    if (!fd || !td) return `${from} até ${to}`;
    return `${fd}/${fm}/${fy} a ${td}/${tm}/${ty}`;
}

export default function CommitmentsOverviewViewMobile({
    title,
    summary,
    isLoadingSummary,
    items,
    total,
    hasMore,
    isLoadingCycles,
    isLoadingMore,
    cyclesError,
    sentinelRef,
    actionContext,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
}: CommitmentsOverviewMobileProps) {
    const [isVisible, setIsVisible] = useState(true);
    const hashStyle = getHashColorStyle(title);

    return (
        <div className="flex w-full flex-col gap-4 pb-12">
            {/* 1. Card de Resumo no Topo */}
            <div className="w-full">
                {isLoadingSummary || !summary ? (
                    <div className="px-4 pt-4">
                        <SummaryCardSkeleton />
                    </div>
                ) : (
                    <ProfileCard className="rounded-t-none border-0 shadow-none pb-2">
                        <ProfileCardBanner
                            style={{
                                backgroundColor: hashStyle.backgroundColor,
                            }}
                        >
                            <ProfileCardAvatar
                                style={{ borderColor: hashStyle.color }}
                            >
                                <CalendarClock
                                    className="size-6 text-muted-foreground stroke-[1.75]"
                                    color={hashStyle.color}
                                />
                            </ProfileCardAvatar>
                        </ProfileCardBanner>

                        <ProfileCardContent>
                            <div className="flex flex-col items-center justify-center text-center gap-0.5">
                                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                                    {title}
                                </h2>
                                <span className="text-[11px] sm:text-xs text-muted-foreground tabular-nums">
                                    {formatIsoRangeLabel(
                                        filters.from,
                                        filters.to
                                    )}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Restante a pagar
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsVisible((v) => !v)
                                        }
                                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors"
                                        aria-label={
                                            isVisible
                                                ? "Ocultar valores"
                                                : "Mostrar valores"
                                        }
                                    >
                                        {isVisible ? (
                                            <Eye className="size-3.5 sm:size-4" />
                                        ) : (
                                            <EyeOff className="size-3.5 sm:size-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums text-foreground">
                                    {isVisible
                                        ? formatMoney(summary.pendingAmount)
                                        : "R$ ••••••"}
                                </div>

                                <CommitmentSummaryProgress
                                    summary={summary}
                                    isVisible={isVisible}
                                />
                            </div>
                        </ProfileCardContent>
                    </ProfileCard>
                )}
            </div>

            {/* 2. Lista de Compromissos + Busca + Botão de Filtros */}
            <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                            Obrigações do período
                        </h2>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {total}
                        </Badge>
                    </div>
                </div>

                <div className="px-4 w-full mb-1">
                    <CommitmentCycleSearch
                        value={filters.q}
                        onChange={(q) => applyFilters({ q })}
                    >
                        <div className="h-3.5 w-px bg-border/70" />
                        <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60"
                            aria-label="Filtrar compromissos"
                        >
                            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                            <span>Filtros</span>
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="h-4 min-w-4 px-1 text-[10px] font-bold"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </InputGroupButton>
                    </CommitmentCycleSearch>
                </div>

                {cyclesError ? (
                    <div className="px-4">
                        <ErrorView
                            title="Erro ao carregar compromissos"
                            error={cyclesError}
                        />
                    </div>
                ) : (
                    <CommitmentCycleList
                        items={items}
                        isLoading={isLoadingCycles}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        sentinelRef={sentinelRef}
                        hasFilters={activeFilterCount > 0}
                        onClearFilters={clearFilters}
                        actionContext={actionContext}
                    />
                )}
            </div>

            {/* 3. Drawer de Filtros Mobile */}
            <CommitmentCycleFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            />
        </div>
    );
}