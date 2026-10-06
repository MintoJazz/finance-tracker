"use client";

import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import { MOVEMENT_COLUMNS } from "./columns";
import { EmptyWalletMovementTable } from "./empty";
import { MovementTableSkeleton } from "../skeletons/movement-table-skeleton";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MOVEMENT_ACTIONS, MovementActionContext } from "../wallet-movements-actions-menu";

interface WalletMovementTableProps {
    data: Page<WalletMovement> | null;
    isLoading?: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
    actionContext?: MovementActionContext;
}

export function WalletMovementTable({
    data,
    isLoading = false,
    hasFilters = false,
    onClearFilters,
    setPage,
    setPageSize,
    actionContext,
}: WalletMovementTableProps) {
    if (isLoading && (!data || data.data.length === 0)) {
        return <MovementTableSkeleton />;
    }

    if (!data || data.data.length === 0) {
        return (
            <EmptyWalletMovementTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all">
                    <span className="text-xs text-muted-foreground animate-pulse">
                        Atualizando extrato...
                    </span>
                </div>
            )}
            <DataTable
                data={data.data}
                columns={MOVEMENT_COLUMNS}
                rowActions={MOVEMENT_ACTIONS}
                actionContext={actionContext}
                showHeader={false}
                manualPagination
                pageIndex={data.pageIndex}
                pageSize={data.pageSize}
                pageCount={data.pageCount}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />
        </div>
    );
}

export default WalletMovementTable;
