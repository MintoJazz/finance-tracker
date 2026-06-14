import { ColumnDef } from "@tanstack/react-table"
import { TransactionRow } from "../hooks/use-transaction-features"
import { cn } from "@/lib/utils"
import { formatarData, formatarDinheiro } from "@/lib/formatters"
import { OPERATION_THEMES } from "../themes/operation-themes"
import StatusBadge from "./status-badge"

export const mobileColumns: ColumnDef<TransactionRow>[] = [
    {
        id: "description",
        header: () => null,
        accessorFn: (r) => r.transaction.description,
        cell: ({ row }) => {
            const { transaction, statusBadgeProps } = row.original
            const opTheme = OPERATION_THEMES[transaction.type]
            const Icon = opTheme.icon

            return (
                <div className="group relative overflow-hidden transition-all flex flex-col pl-4 py-2 -mt-1 gap-1" >
                    <div className="flex w-full items-end gap-3">
                        <div className="w-0 min-w-0 flex-1 pt-0.5">
                            <p className="truncate text-sm font-medium text-foreground">
                                {transaction.description}
                            </p>
                        </div>
                        <div className="shrink-0 pl-1 pt-0.5 text-right">
                            <p
                                className={cn(
                                    "whitespace-nowrap tabular-nums font-mono leading-tight",
                                    opTheme.color
                                )}
                            >
                                {formatarDinheiro(transaction.amount)}
                            </p>
                        </div>
                    </div>
                    <div className={cn("flex w-full items-start justify-between transition-colors")} >
                        <div className="flex gap-2 items-center">
                            <Icon size={16} className={opTheme.color}/>
                            <StatusBadge {...statusBadgeProps} />
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <span className="tabular-nums text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {formatarData(transaction.date)}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        meta: { className: "p-0 w-full" }, // <- adiciona isso
    }
]