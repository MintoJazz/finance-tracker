"use client";

import React, { useMemo } from "react";
import { DataTable, RowAction } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { createMovementEntryColumns } from "./columns";
import { MovementTableSkeleton } from "../skeletons/movement-table-skeleton";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MovementEntryTablePaginationContext {
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
}

export interface MovementEntryTableProps<TContext = unknown> {
    data: Page<MovementEntry> | MovementEntry[] | null;
    scope: MovementEntryScope;
    isLoading?: boolean;
    paginationContext?: MovementEntryTablePaginationContext;
    rowActions?: RowAction<MovementEntry, TContext>[];
    actionContext?: TContext;
    loadingMessage?: string;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export function MovementEntryTable<TContext = unknown>({
    data,
    scope,
    isLoading = false,
    paginationContext,
    rowActions,
    actionContext,
    loadingMessage = "Atualizando lançamentos...",
    hasFilters = false,
    onClearFilters,
    className,
}: MovementEntryTableProps<TContext>) {
    const columns = useMemo(() => createMovementEntryColumns(scope), [scope]);

    // Trata se data é Page<MovementEntry> ou array puro
    const isPaged = data !== null && typeof data === "object" && "data" in data;
    const items: MovementEntry[] = isPaged ? data.data : (data as MovementEntry[]) ?? [];

    if (isLoading && items.length === 0) {
        return <MovementTableSkeleton />;
    }

    if (!data || items.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/70 bg-card/40 my-2",
                    className
                )}
            >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                    <Inbox className="size-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                    Nenhum lançamento encontrado
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mb-4">
                    {hasFilters
                        ? "Nenhum lançamento corresponde aos filtros ativos."
                        : "Não há movimentações registradas neste período."}
                </p>
                {hasFilters && onClearFilters && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs"
                    >
                        Limpar filtros
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all">
                    <span className="text-xs text-muted-foreground animate-pulse">
                        {loadingMessage}
                    </span>
                </div>
            )}
            <DataTable
                data={items}
                columns={columns}
                rowActions={rowActions}
                actionContext={actionContext}
                showHeader={false}
                manualPagination={Boolean(paginationContext && isPaged)}
                enablePagination={Boolean(paginationContext && isPaged)}
                pageIndex={isPaged ? data.pageIndex : 0}
                pageSize={isPaged ? data.pageSize : items.length}
                pageCount={isPaged ? data.pageCount : 1}
                onPageChange={paginationContext?.setPage}
                onPageSizeChange={paginationContext?.setPageSize}
            />
        </div>
    );
}

export default MovementEntryTable;

