"use client";

import { DataTable } from "@/components/data-table";
import type { Page } from "@/types/pagination.types";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import {
    INSTALLMENT_ACTIONS,
    type InstallmentActionContext,
} from "../installment-actions-drawer";
import { INSTALLMENT_COLUMNS } from "./columns";
import EmptyInstallmentTable from "./empty";

interface Props {
    data: Page<InstallmentListItem>;
    actionContext: InstallmentActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    setPage?: (val: number) => void;
    setPageSize?: (val: number) => void;
}

export default function InstallmentTable({
    data,
    actionContext,
    hasFilters = false,
    onClearFilters,
    setPage,
    setPageSize,
}: Props) {
    if (data.data.length === 0) {
        return (
            <EmptyInstallmentTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <DataTable
            data={data.data}
            columns={INSTALLMENT_COLUMNS}
            rowActions={INSTALLMENT_ACTIONS}
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
