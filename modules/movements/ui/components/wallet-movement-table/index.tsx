"use client";

import { Page } from "@/types/pagination.types";
import { WALLET_MOVEMENT_COLUMNS } from "./columns";
import { EmptyWalletMovementTable } from "./empty";
import { WalletMovement } from "@/modules/movements/models/wallet-movement.schema";
import { MOVEMENT_ACTIONS, MovementActionContext } from "../wallet-movements-actions-menu";
import { MovementTable } from "../movement-table";

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
    return (
        <MovementTable
            columns={WALLET_MOVEMENT_COLUMNS}
            data={data}
            isLoading={isLoading}
            paginationContext={{ setPage, setPageSize }}
            rowActions={MOVEMENT_ACTIONS}
            actionContext={actionContext}
            loadingMessage="Atualizando extrato..."
        >
            <EmptyWalletMovementTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        </MovementTable>
    );
}

export default WalletMovementTable;
