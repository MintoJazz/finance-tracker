import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { formatDate, formatMoney } from "@/lib/formatters"
import { OPERATION_THEMES } from "../themes/operation-themes"
import StatusBadge from "./status-badge"
import { TransactionRow } from "../hooks/use-transaction-features"

export const desktopColumns: ColumnDef<TransactionRow>[] = [
    {
        id: "type",
        header: "Tipo",
        cell: ({ row }) => {
            const theme = OPERATION_THEMES[row.original.transaction.type]
            const Icon = theme.icon
            return (
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", theme.bg)}>
                        <Icon size={14} className={theme.color} />
                    </div>
                    <span className="text-xs text-muted-foreground">{theme.label}</span>
                </div>
            )
        },
    },
    {
        id: "description",
        accessorFn: (r) => r.transaction.description,
        header: "Descrição",
        cell: ({ row }) => (
            <span className="text-sm font-medium truncate block max-w-70">
                {row.original.transaction.description}
            </span>
        ),
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge {...row.original.statusBadgeProps} />,
    },
    {
        id: "date",
        accessorFn: (r) => r.transaction.date,
        header: "Data",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground tabular-nums">
                {formatDate(row.original.transaction.date)}
            </span>
        ),
    },
    {
        id: "amount",
        accessorFn: (r) => r.transaction.amount,
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => {
            const t = row.original.transaction
            const isExpense = t.type === "EXPENSE"
            const isIncome = t.type === "INCOME"
            return (
                <div className={cn(
                    "text-right text-sm font-semibold font-mono tabular-nums",
                    isExpense && "text-rose-600 dark:text-rose-400",
                    isIncome && "text-emerald-600 dark:text-emerald-400",
                )}>
                    {formatMoney(t.amount)}
                </div>
            )
        },
    },
]
