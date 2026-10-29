"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyCreditMovementList } from "@/modules/movements/ui/components/credit-movement-list/empty";
import { MovementList } from "@/modules/movements/ui/components/movement-list";
import { CycleEntryRow } from "@/modules/cycles/models/contract-cycle.schema";
import { orderEntriesWithReversals } from "../contract-cycle-entry-table";
import { ContractCycleEntryListItem } from "./entry-item";
import {
    ContractCycleEntryActionsDrawer,
    CycleEntryActionContext,
} from "../contract-cycle-entry-actions";

interface ContractCycleEntryListProps {
    entries: CycleEntryRow[];
    actionContext: CycleEntryActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export function ContractCycleEntryList({
    entries,
    actionContext,
    hasFilters = false,
    onClearFilters,
    className,
}: ContractCycleEntryListProps) {
    const [activeEntry, setActiveEntry] = React.useState<CycleEntryRow | null>(null);

    const data = React.useMemo(
        () => orderEntriesWithReversals(entries),
        [entries]
    );

    if (entries.length === 0) {
        return (
            <EmptyCreditMovementList
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
                className={className}
            />
        );
    }

    return (
        <MovementList className={cn("w-full flex flex-col", className)}>
            <MovementList.Content>
                {data.map((entry) => (
                    <ContractCycleEntryListItem
                        key={entry.id}
                        entry={entry}
                        onOpenActions={() => setActiveEntry(entry)}
                    />
                ))}
            </MovementList.Content>

            {/* Gaveta de Ações do Lançamento Selecionado no Mobile */}
            <ContractCycleEntryActionsDrawer
                entry={activeEntry}
                open={Boolean(activeEntry)}
                onOpenChange={(open) => {
                    if (!open) setActiveEntry(null);
                }}
                context={actionContext}
            />
        </MovementList>
    );
}

export default ContractCycleEntryList;
