import React from "react";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { resolveMovementEntryAmountPresentation } from "./presentation";

interface MovementEntryAmountProps {
    entry: MovementEntry;
    scope: MovementEntryScope;
    className?: string;
}

export function MovementEntryAmount({
    entry,
    scope,
    className,
}: MovementEntryAmountProps) {
    const { amount, isReversed } = entry;
    const { displayPrefix, colorClassName } =
        resolveMovementEntryAmountPresentation(entry, scope);

    return (
        <span
            className={cn(
                "font-medium font-mono tabular-nums text-sm whitespace-nowrap",
                colorClassName,
                isReversed && "line-through opacity-50 text-muted-foreground",
                className
            )}
        >
            {displayPrefix}
            {formatMoney(amount)}
        </span>
    );
}

