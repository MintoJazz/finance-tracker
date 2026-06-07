import { ColumnDef } from "@tanstack/react-table"
import { TransactionRow } from "../hooks/use-transaction-features"
import TransactionMobileCard from "./transaction-mobile-card"

export const mobileColumns: ColumnDef<TransactionRow>[] = [
    {
        id: "row",
        accessorFn: (r) => r.transaction.description,
        cell: ({ row }) => <TransactionMobileCard row={row.original} />,
        meta: { className: "p-0 w-full" }, // <- adiciona isso
    },
]