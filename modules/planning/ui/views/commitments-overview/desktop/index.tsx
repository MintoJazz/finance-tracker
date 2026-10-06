"use client";

import { useState } from "react";
import { CalendarClock, Eye, EyeOff, X } from "lucide-react";
import { ErrorView } from "@/components/error-view";
import {
    ProfileCard,
    ProfileCardAvatar,
    ProfileCardBanner,
    ProfileCardContent,
} from "@/components/profile-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatMoney } from "@/lib/formatters";
import { CommitmentCycleFilterForm } from "../../../components/commitment-cycle-filter-form";
import { CommitmentCycleSearch } from "../../../components/commitment-cycle-search";
import { CommitmentCycleTable } from "../../../components/commitment-cycle-table";
import { CommitmentSummaryProgress } from "../../../components/commitment-summary-progress";
import { SummaryCardSkeleton } from "../../../components/skeletons/summary-card-skeleton";
import { CommitmentsOverviewDesktopProps } from "../types";

function formatIsoRangeLabel(from: string, to: string): string {
    const [fy, fm, fd] = from.split("-");
    const [ty, tm, td] = to.split("-");
    if (!fd || !td) return `${from} até ${to}`;
    return `${fd}/${fm}/${fy} a ${td}/${tm}/${ty}`;
}

export default function CommitmentsOverviewViewDesktop({
    title,
    summary,
    isLoadingSummary,
    cyclesData,
    isLoadingCycles,
    cyclesError,
    actionContext,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    paginationContext,
}: CommitmentsOverviewDesktopProps) {
    const [isVisible, setIsVisible] = useState(true);
    const hashStyle = getHashColorStyle(title);

    return (
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col gap-5 p-4 md:p-6 lg:p-8 lg:py-2 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] xl:grid-cols-[minmax(0,1fr)_310px] items-start gap-6 w-full min-w-0">
                {/* Coluna Esquerda: Busca + Tabela de Ciclos */}
                <main className="min-w-0 w-full flex flex-col gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold tracking-tight text-foreground">
                                {title}
                            </h2>
                            <Badge variant="outline" className="tabular-nums text-xs">
                                {cyclesData?.total ?? 0}
                            </Badge>
                        </div>
                        {activeFilterCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {activeFilterCount}{" "}
                                {activeFilterCount === 1
                                    ? "filtro ativo"
                                    : "filtros ativos"}
                            </span>
                        )}
                    </div>

                    <CommitmentCycleSearch
                        value={filters.q}
                        onChange={(q) => applyFilters({ q })}
                        className="mb-1"
                    />

                    {cyclesError ? (
                        <ErrorView
                            title="Erro ao carregar compromissos"
                            error={cyclesError}
                        />
                    ) : (
                        <CommitmentCycleTable
                            data={cyclesData}
                            isLoading={isLoadingCycles}
                            hasFilters={activeFilterCount > 0}
                            onClearFilters={clearFilters}
                            setPage={paginationContext.setPage}
                            setPageSize={paginationContext.setPageSize}
                            actionContext={actionContext}
                        />
                    )}
                </main>

                {/* Coluna Direita: Sticky Sidebar com Resumo do Período + Filtros */}
                <aside className="w-full flex flex-col gap-5 lg:sticky lg:top-6 min-w-0">
                    {isLoadingSummary || !summary ? (
                        <SummaryCardSkeleton />
                    ) : (
                        <ProfileCard>
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
                                        Resumo do Período
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

                            <div className="border-t border-border/40 mx-4 sm:mx-4.5" />

                            {/* Filtros do Período */}
                            <div className="px-4 sm:px-4.5 pb-4 pt-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Filtros
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 -mr-1"
                                        >
                                            <X className="size-3" />
                                            Limpar
                                        </Button>
                                    )}
                                </div>

                                <CommitmentCycleFilterForm
                                    values={filters}
                                    onChange={applyFilters}
                                    onReset={clearFilters}
                                    hideResetButton
                                />
                            </div>
                        </ProfileCard>
                    )}
                </aside>
            </div>
        </div>
    );
}