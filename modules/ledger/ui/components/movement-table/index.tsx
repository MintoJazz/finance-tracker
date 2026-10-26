"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, RowAction } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementTableSkeleton } from "../skeletons/movement-table-skeleton";

export interface MovementTablePaginationContext {
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
}

export interface MovementTableProps<TContext = unknown> {
    columns: ColumnDef<WalletMovement, unknown>[];
    data: Page<WalletMovement> | null;
    isLoading?: boolean;
    paginationContext: MovementTablePaginationContext;
    rowActions?: RowAction<WalletMovement, TContext>[];
    actionContext?: TContext;
    loadingMessage?: string;
    children?: React.ReactNode;
}

export function MovementTable<TContext = unknown>({
    columns,
    data,
    isLoading = false,
    paginationContext,
    rowActions,
    actionContext,
    loadingMessage = "Atualizando lançamentos...",
    children,
}: MovementTableProps<TContext>) {
    if (isLoading && (!data || data.data.length === 0)) {
        return <MovementTableSkeleton />;
    }

    if (!data || data.data.length === 0) {
        return children ? <>{children}</> : null;
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all">
                    <span className="text-xs text-muted-foreground animate-pulse">
                        {loadingMessage}
                    </span>
                </div>
            )}
            <DataTable
                data={data.data}
                columns={columns}
                rowActions={rowActions}
                actionContext={actionContext}
                showHeader={false}
                manualPagination
                pageIndex={data.pageIndex}
                pageSize={data.pageSize}
                pageCount={data.pageCount}
                onPageChange={paginationContext.setPage}
                onPageSizeChange={paginationContext.setPageSize}
            />
        </div>
    );
}
