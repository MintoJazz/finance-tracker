"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { EmptyContractCycleEntryTable } from "./empty";
import { CycleEntryRow } from "@/modules/cycles/models/contract-cycle.schema";
import { CONTRACT_CYCLE_ENTRY_COLUMNS } from "./columns";
import {
    buildCycleEntryActions,
    CycleEntryActionContext,
} from "../contract-cycle-entry-actions";

export function orderEntriesWithReversals(
    entries: CycleEntryRow[]
): CycleEntryRow[] {
    const standalone = entries.filter((e) => e.type !== "REVERSAL");
    const reversals = entries.filter((e) => e.type === "REVERSAL");

    const result: CycleEntryRow[] = [];
    for (const entry of standalone) {
        result.push(entry);
        const linkedReversals = reversals.filter(
            (r) => r.reversesEntryId === entry.id
        );
        result.push(...linkedReversals);
    }

    const placedIds = new Set(result.map((r) => r.id));
    for (const r of reversals) {
        if (!placedIds.has(r.id)) {
            result.push(r);
        }
    }

    return result;
}

interface ContractCycleEntryTableProps {
    entries: CycleEntryRow[];
    actionContext: CycleEntryActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export function ContractCycleEntryTable({
    entries,
    actionContext,
    hasFilters = false,
    onClearFilters,
    className,
}: ContractCycleEntryTableProps) {
    const data = React.useMemo(
        () => orderEntriesWithReversals(entries),
        [entries]
    );

    const rowActions = React.useMemo(
        () => buildCycleEntryActions(),
        []
    );

    if (entries.length === 0) {
        return (
            <EmptyContractCycleEntryTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <div className={className}>
            <DataTable
                data={data}
                columns={CONTRACT_CYCLE_ENTRY_COLUMNS}
                rowActions={rowActions}
                actionContext={actionContext}
                showHeader={false}
                enablePagination={false}
            />
        </div>
    );
}

export default ContractCycleEntryTable;
