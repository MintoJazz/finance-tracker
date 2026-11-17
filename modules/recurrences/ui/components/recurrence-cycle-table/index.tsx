"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import { RECURRENCE_CYCLE_COLUMNS } from "./columns";
import {
    RECURRENCE_CYCLE_ACTIONS,
    type RecurrenceCycleActionContext,
} from "./actions";
import EmptyRecurrenceCycleTable from "./empty";

export interface RecurrenceCycleTableProps {
    cycles: CycleItem[];
    actionContext?: RecurrenceCycleActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    isLoading?: boolean;
}

export function RecurrenceCycleTable({
    cycles,
    actionContext,
    hasFilters = false,
    onClearFilters,
}: RecurrenceCycleTableProps) {
    if (cycles.length === 0) {
        return (
            <EmptyRecurrenceCycleTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <DataTable
            data={cycles}
            columns={RECURRENCE_CYCLE_COLUMNS}
            rowActions={RECURRENCE_CYCLE_ACTIONS}
            actionContext={actionContext}
            showHeader={false}
            enablePagination={false}
            onRowClick={
                actionContext?.onViewCycle
                    ? (row) => actionContext.onViewCycle?.(row.original)
                    : undefined
            }
        />
    );
}

export default RecurrenceCycleTable;

