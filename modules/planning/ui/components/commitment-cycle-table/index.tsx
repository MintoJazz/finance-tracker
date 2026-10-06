// modules/planning/ui/components/commitment-cycle-table/index.tsx
"use client";

import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import { CommitmentCycleItem } from "../../../core/schemas/commitment-cycle.schema";
import {
    COMMITMENT_CYCLE_ACTIONS,
    CommitmentCycleActionContext,
} from "../commitment-cycle-actions-drawer";
import { CycleTableSkeleton } from "../skeletons/cycle-table-skeleton";
import { COMMITMENT_CYCLE_COLUMNS } from "./columns";
import EmptyCommitmentCycleTable from "./empty";

interface Props {
    data: Page<CommitmentCycleItem> | null;
    isLoading: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    setPage: (pageIndex: number) => void;
    setPageSize: (size: number) => void;
    actionContext: CommitmentCycleActionContext;
}

export function CommitmentCycleTable({
    data,
    isLoading,
    hasFilters,
    onClearFilters,
    setPage,
    setPageSize,
    actionContext,
}: Props) {
    if (isLoading || !data) {
        return <CycleTableSkeleton />;
    }

    if (data.data.length === 0) {
        return (
            <EmptyCommitmentCycleTable
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <DataTable
            {...data}
            columns={COMMITMENT_CYCLE_COLUMNS}
            rowActions={COMMITMENT_CYCLE_ACTIONS}
            actionContext={actionContext}
            showHeader={false}
            manualPagination
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRowClick={
                actionContext.onViewDetails
                    ? (row) => actionContext.onViewDetails?.(row.original)
                    : undefined
            }
        />
    );
}

export default CommitmentCycleTable;