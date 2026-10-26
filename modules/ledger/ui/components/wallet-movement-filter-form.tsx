"use client";

import { WalletMovementFilters } from "../../core/schemas/wallet-movement.schema";
import { MovementFilter } from "./movement-filter";

interface WalletMovementFilterFormProps {
    values: WalletMovementFilters;
    onChange: (updates: Partial<WalletMovementFilters>) => void;
    onReset?: () => void;
    className?: string;
    hideResetButton?: boolean;
    hideDateRange?: boolean;
}

export function WalletMovementFilterForm({
    values,
    onChange,
    onReset,
    className,
    hideResetButton = false,
    hideDateRange = false,
}: WalletMovementFilterFormProps) {
    return (
        <MovementFilter
            values={values}
            onChange={onChange}
            onReset={onReset}
            className={className}
        >
            <MovementFilter.Direction />
            {!hideDateRange && <MovementFilter.DateRange />}
            <MovementFilter.Types />
            {!hideResetButton && <MovementFilter.ResetButton />}
        </MovementFilter>
    );
}
