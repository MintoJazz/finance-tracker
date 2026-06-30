import { Row } from "@tanstack/react-table";
import { TransactionDetails } from "@/types/database";
import { TransactionStatus } from "@/generated/prisma/enums";
import { RowAction } from "@/components/ui/data-table";
import { TransactionRow } from "@/app/(planner)/hook";
import { desktopColumns } from "./transaction-columns";

export function useTransactionTable(
    transactions: TransactionDetails[], 
    selectAll: (ids: number[]) => void, 
    onStatusChange: (id: number, status: TransactionStatus) => void,
    originalActions: RowAction<TransactionDetails>[]
) {
    const data: TransactionRow[] = transactions.map(transaction => ({
        transaction,
        statusBadgeProps: {
            current: transaction.status,
            onClick: (status: TransactionStatus) => onStatusChange(transaction.id, status),
        }
    }))

    const onRowSelectionChange = (rowsSelected: Row<TransactionRow>[]) => selectAll(rowsSelected.map(row => row.original.transaction.id))

    const rowActions: RowAction<TransactionRow>[] = originalActions.map(a => ({
        label: a.label,
        onClick: (row) => a.onClick({ original: row.original.transaction } as Row<TransactionDetails>),
    }))

    return {
        data, onRowSelectionChange, rowActions,
        columns: desktopColumns,
        filterColumn: "description",
        filterPlaceholder: "Filtrar descrição...",
        pageSize: 10,
        enableRowSelection: true,
    }
}