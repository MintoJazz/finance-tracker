"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { ContractCycleItem } from "../../../../core/schemas/contract-cycle.schema";
import { CONTRACT_CYCLE_COLUMNS } from "./columns";
import {
    CONTRACT_CYCLE_ACTIONS,
    ContractCycleActionContext,
} from "../contract-cycle-actions";
import { RowAction } from "@/types/actions.types";

interface ContractCycleTableProps {
    data: Page<ContractCycleItem> | null;
    isLoading: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    setPage?: (pageIndex: number) => void;
    setPageSize?: (size: number) => void;
    onRowClick?: (cycle: ContractCycleItem) => void;
    cycleActionContext?: ContractCycleActionContext;
    actions?: RowAction<ContractCycleItem, ContractCycleActionContext>[];
}

export function ContractCycleTable({
    data,
    isLoading,
    hasFilters = false,
    onClearFilters,
    setPage,
    setPageSize,
    onRowClick,
    cycleActionContext,
    actions,
}: ContractCycleTableProps) {

    if (isLoading && (!data || data.data.length === 0)) {
        return (
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4">
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={`cycle-skeleton-${i}`}
                            className="flex items-center justify-between gap-4 py-2 border-b border-border/30 last:border-0"
                        >
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/70 bg-card/50">
                <div className="rounded-full bg-muted p-3 mb-3">
                    <Sparkles className="size-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                    Nenhum ciclo encontrado
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    {hasFilters
                        ? "Nenhum ciclo corresponde aos filtros aplicados neste contrato."
                        : "Não há ciclos gerados ou projetados para este contrato."}
                </p>
                {hasFilters && onClearFilters && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-4 h-8 text-xs gap-1.5"
                    >
                        <X className="size-3.5" />
                        Limpar filtros
                    </Button>
                )}
            </div>
        );
    }

    return (
        <DataTable
            columns={CONTRACT_CYCLE_COLUMNS}
            data={data.data}
            showHeader={false}
            manualPagination={Boolean(setPage)}
            pageCount={data.pageCount}
            pageIndex={data.pageIndex}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSize={data.pageSize}
            enablePagination={Boolean(setPage)}
            onRowClick={onRowClick ? (row) => onRowClick(row.original) : undefined}
            rowActions={actions ?? (cycleActionContext ? CONTRACT_CYCLE_ACTIONS : undefined)}
            actionContext={cycleActionContext}
        />
    );
}

export default ContractCycleTable;
