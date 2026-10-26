"use client";

import { WalletMovementFilters } from "../../core/schemas/wallet-movement.schema";
import { MovementFilter } from "./movement-filter";
import { MovementFilterDrawer } from "./movement-filter/drawer";

interface WalletMovementFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: WalletMovementFilters;
    onApply: (appliedFilters: WalletMovementFilters) => void;
    onClear: () => void;
    hideDateRange?: boolean;
}

export function WalletMovementFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    hideDateRange = false,
}: WalletMovementFilterDrawerProps) {
    return (
        <MovementFilterDrawer
            open={open}
            onOpenChange={onOpenChange}
            filters={filters}
            onApply={onApply}
            onClear={onClear}
            title="Filtros do Extrato"
            description="Filtre as movimentações por período, tipo e direção."
        >
            <MovementFilter.Direction />
            {!hideDateRange && <MovementFilter.DateRange />}
            <MovementFilter.Types />
        </MovementFilterDrawer>
    );
}
