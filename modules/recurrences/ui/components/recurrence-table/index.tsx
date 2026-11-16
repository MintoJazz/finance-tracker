"use client";

import { DataTable } from "@/components/data-table";
import type { Page } from "@/types/pagination.types";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    RECURRENCE_ACTIONS,
    type RecurrenceActionContext,
} from "../recurrence-actions-drawer";
import { RECURRENCE_COLUMNS } from "./columns";
import EmptyRecurrenceTable from "./empty";

interface Props {
    data: Page<RecurrenceListItem>;
    actionContext: RecurrenceActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    setPage?: (val: number) => void;
    setPageSize?: (val: number) => void;
}

export default function RecurrenceTable({
    data,
    actionContext,
    hasFilters = false,
    onClearFilters,
    setPage,
    setPageSize,
}: Props) {
    if (data.data.length === 0) {
        return (
            <EmptyRecurrenceTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <DataTable
            data={data.data}
            columns={RECURRENCE_COLUMNS}
            rowActions={RECURRENCE_ACTIONS}
            actionContext={actionContext}
            showHeader={false}
            manualPagination
            pageIndex={data.pageIndex}
            pageSize={data.pageSize}
            pageCount={data.pageCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRowClick={
                actionContext.onView
                    ? (row) => actionContext.onView?.(row.original)
                    : undefined
            }
        />
    );
}

