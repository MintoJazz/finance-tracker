"use client";

import React, { useMemo } from "react";
import { Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { InputGroupButton } from "@/components/ui/input-group";
import { ErrorView } from "@/components/error-view";
import { formatDate } from "@/lib/formatters";
import { WalletMovementSearch } from "@/modules/movements/ui/components/wallet-movement-search";
import { MovementEntryList } from "@/modules/movements/ui/components/movement-entry-list";
import { CycleNavigatorMobile } from "@/modules/cycles/ui/components/cycle-navigator/mobile";
import { CycleSummaryMobile } from "@/modules/cycles/ui/components/cycle-summary/mobile";
import {
    CYCLE_STATUS_TONE_MAP,
    CYCLE_SUMMARY_LABELS,
} from "@/modules/cycles/ui/components/cycle-summary/labels";
import { CycleStatementMobileProps } from "../types";

export function CycleStatementMobileView({
    cycleDetail,
    isLoadingDetail,
    detailError,
    items,
    total,
    hasMore,
    isLoadingMovements,
    isLoadingMore,
    movementsError,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    onNavigate,
    onOpenFilters,
    sentinelRef,
    scope,
    onSelectEntry,
}: CycleStatementMobileProps) {
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
        <div className="w-full flex flex-col gap-1 min-w-0">
            {/* 1. Navegador de Ciclo (Full-Bleed) */}
            <CycleNavigatorMobile
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

            {/* 2. Resumo de Valores e Metadados (Full-Bleed) */}
            <CycleSummaryMobile
                labels={labels}
                total={cycleDetail?.totalAmount ?? 0}
                paid={cycleDetail?.paidAmount ?? 0}
                open={cycleDetail?.remainingAmount ?? 0}
                period={formattedPeriod}
                dueDate={formattedDueDate}
                isLoading={isLoadingDetail}
            />

            {/* 3. Seção Extrato de Movimentações */}
            <div className="flex flex-col gap-2.5 pt-1">
                {/* Linha de Cabeçalho: Título, Total e Toggle Estornadas */}
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                            Extrato
                        </h3>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {total}
                        </Badge>
                    </div>

                    <Toggle
                        size="sm"
                        variant="outline"
                        pressed={Boolean(filters.includeReversed)}
                        onPressedChange={(pressed) =>
                            applyFilters({ includeReversed: pressed })
                        }
                        className="text-xs h-8 px-2.5 gap-1.5 border-border/80"
                        aria-label="Incluir movimentações estornadas"
                    >
                        {filters.includeReversed ? (
                            <Eye className="size-3.5" />
                        ) : (
                            <EyeOff className="size-3.5 text-muted-foreground" />
                        )}
                        <span>Estornadas</span>
                    </Toggle>
                </div>

                {/* Toolbar Mobile: Busca com Botão de Filtros Integrado */}
                <div className="w-full mb-1 px-4">
                    <WalletMovementSearch
                        value={filters.q}
                        onChange={(q: string | undefined) => applyFilters({ q })}
                    >
                        <div className="h-3.5 w-px bg-border/70" />
                        <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={onOpenFilters}
                            className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer"
                            aria-label="Filtrar movimentações"
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
                    </WalletMovementSearch>
                </div>

                {/* Lista de Movimentações Full-Bleed ou Erro */}
                {movementsError ? (
                    <ErrorView
                        title="Erro ao carregar movimentações"
                        error={movementsError}
                    />
                ) : (
                    <MovementEntryList
                        entries={items}
                        scope={scope}
                        isLoading={isLoadingMovements}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        hasFilters={activeFilterCount > 0}
                        onClearFilters={clearFilters}
                        sentinelRef={sentinelRef}
                        onSelectEntry={onSelectEntry}
                    />
                )}
            </div>
        </div>
    );
}
