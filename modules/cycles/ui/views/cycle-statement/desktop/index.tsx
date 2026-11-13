"use client";

import React, { useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ErrorView } from "@/components/error-view";
import { formatDate } from "@/lib/formatters";
import { WalletMovementSearch } from "@/modules/movements/ui/components/wallet-movement-search";
import { MovementEntryTable } from "@/modules/movements/ui/components/movement-entry-table";
import { CycleNavigatorDesktop } from "@/modules/cycles/ui/components/cycle-navigator/desktop";
import { CycleSummaryDesktop } from "@/modules/cycles/ui/components/cycle-summary/desktop";
import {
    CYCLE_STATUS_TONE_MAP,
    CYCLE_SUMMARY_LABELS,
} from "@/modules/cycles/ui/components/cycle-summary/labels";
import { CycleStatementDesktopProps } from "../types";

export function CycleStatementDesktopView<TContext = unknown>({
    cycleDetail,
    isLoadingDetail,
    detailError,
    movementsData,
    isLoadingMovements,
    movementsError,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    onNavigate,
    paginationContext,
    scope,
    rowActions,
    actionContext,
}: CycleStatementDesktopProps<TContext>) {
    const labels = useMemo(() => CYCLE_SUMMARY_LABELS[scope], [scope]);

    const statusInfo = useMemo(() => {
        if (!cycleDetail) {
            return { label: "Carregando...", tone: "neutral" as const };
        }
        return (
            CYCLE_STATUS_TONE_MAP[cycleDetail.status] ?? {
                label: cycleDetail.status,
                tone: "neutral" as const,
            }
        );
    }, [cycleDetail]);

    const formattedPeriod = useMemo(() => {
        if (!cycleDetail) return "";
        return `${formatDate(cycleDetail.from)} a ${formatDate(cycleDetail.to)}`;
    }, [cycleDetail]);

    const formattedDueDate = useMemo(() => {
        if (!cycleDetail?.dueDate) return "";
        return formatDate(cycleDetail.dueDate);
    }, [cycleDetail]);

    return (
        <div className="w-full flex flex-col gap-2 min-w-0">
            {/* 1. Navegador de Ciclo */}
            <CycleNavigatorDesktop
                title={cycleDetail?.label ?? "Carregando ciclo..."}
                status={statusInfo}
                canPrev={Boolean(cycleDetail?.prev)}
                canNext={Boolean(cycleDetail?.next)}
                onPrev={() => cycleDetail?.prev && onNavigate(cycleDetail.prev)}
                onNext={() => cycleDetail?.next && onNavigate(cycleDetail.next)}
                isLoading={isLoadingDetail}
            />

            {/* Tratamento de Erro do Ciclo */}
            {detailError && (
                <div className="my-2">
                    <ErrorView
                        title="Erro ao carregar ciclo"
                        error={detailError}
                    />
                </div>
            )}

            {/* 2. Resumo de Valores e Metadados (Solto) */}
            <CycleSummaryDesktop
                labels={labels}
                total={cycleDetail?.totalAmount ?? 0}
                paid={cycleDetail?.paidAmount ?? 0}
                open={cycleDetail?.remainingAmount ?? 0}
                period={formattedPeriod}
                dueDate={formattedDueDate}
                isLoading={isLoadingDetail}
            />

            {/* 3. Seção Extrato de Movimentações */}
            <main className="min-w-0 w-full flex flex-col gap-3.5 mt-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                            Extrato
                        </h3>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {movementsData?.total ?? 0}
                        </Badge>
                    </div>

                    {activeFilterCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {activeFilterCount}{" "}
                            {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2.5 w-full mb-1">
                    <WalletMovementSearch
                        value={filters.q}
                        onChange={(q: string | undefined) => applyFilters({ q })}
                        className="flex-1"
                    />

                    <Toggle
                        size="sm"
                        variant="outline"
                        pressed={Boolean(filters.includeReversed)}
                        onPressedChange={(pressed) =>
                            applyFilters({ includeReversed: pressed })
                        }
                        className="text-xs gap-1.5 shrink-0"
                        aria-label="Incluir movimentações estornadas"
                    >
                        {filters.includeReversed ? (
                            <Eye className="size-3.5" />
                        ) : (
                            <EyeOff className="size-3.5 text-muted-foreground" />
                        )}
                        Incluir estornadas
                    </Toggle>
                </div>

                {movementsError ? (
                    <ErrorView
                        title="Erro ao carregar movimentações"
                        error={movementsError}
                    />
                ) : (
                    <MovementEntryTable
                        data={movementsData}
                        scope={scope}
                        isLoading={isLoadingMovements}
                        paginationContext={paginationContext}
                        hasFilters={activeFilterCount > 0}
                        onClearFilters={clearFilters}
                        rowActions={rowActions}
                        actionContext={actionContext}
                    />
                )}
            </main>
        </div>
    );
}
