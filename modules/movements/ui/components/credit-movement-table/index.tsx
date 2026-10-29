"use client";

import { Page } from "@/types/pagination.types";
import { CREDIT_MOVEMENT_COLUMNS } from "./columns";
import { EmptyCreditMovementTable } from "./empty";
import { WalletMovement } from "@/modules/movements/models/wallet-movement.schema";
import { MOVEMENT_ACTIONS, MovementActionContext } from "../wallet-movements-actions-menu";
import { MovementTable } from "../movement-table";

interface CreditMovementTableProps {
    data: Page<WalletMovement> | null;
    isLoading?: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
    actionContext?: MovementActionContext;
}

export function CreditMovementTable({
    data,
    isLoading = false,
    hasFilters = false,
    onClearFilters,
    setPage,
    setPageSize,
    actionContext,
}: CreditMovementTableProps) {
    return (
        <MovementTable
            columns={CREDIT_MOVEMENT_COLUMNS}
            data={data}
            isLoading={isLoading}
            paginationContext={{ setPage, setPageSize }}
            rowActions={MOVEMENT_ACTIONS}
            actionContext={actionContext}
            loadingMessage="Atualizando fatura..."
        >
            <EmptyCreditMovementTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        </MovementTable>
    );
}

export default CreditMovementTable;
