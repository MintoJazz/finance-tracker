import { ColumnDef } from "@tanstack/react-table"
import { TransactionRow } from "../hooks/use-transaction-features"
import { cn } from "@/lib/utils"
import { formatarData, formatarDinheiro } from "@/lib/formatters"
import { OPERATION_THEMES } from "../themes/operation-themes"
import StatusBadge from "./status-badge"
import { Badge } from "@/components/ui/badge"
import TransactionMenu from "./transaction-menu"

export const mobileColumns: ColumnDef<TransactionRow>[] = [
    {
        id: "row",
        accessorFn: (r) => r.transaction.description,
        cell: ({ row }) => {
            const { transaction, actionTheme, statusBadgeProps } = row.original
            const opTheme = OPERATION_THEMES[transaction.type]
            const Icon = opTheme.icon

            return (
                <div className="group relative overflow-hidden transition-all flex flex-col pl-4 p-2 gap-2" >
                    {/* ── BODY ─────────────────────────────────────────────── */}
                    <div className="flex w-full items-start gap-3">

                        {/* A MÁGICA ESTÁ AQUI: w-0 flex-1 min-w-0
                  O w-0 impede que a tabela estique a tela para caber o texto.
                */}
                        <div className="w-0 min-w-0 flex-1 pt-0.5">
                            <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                                {transaction.description}
                            </p>
                        </div>

                        {/* Valor em destaque */}
                        <div className="shrink-0 pl-1 pt-0.5 text-right">
                            <p
                                className={cn(
                                    "whitespace-nowrap tabular-nums text-base font-bold leading-tight",
                                    opTheme.color
                                )}
                            >
                                {formatarDinheiro(transaction.amount)}
                            </p>
                        </div>
                    </div>

                    {/* ── FOOTER ───────────────────────────────────────────── */}
                    <div
                        className={cn(
                            "flex w-full items-center justify-between transition-colors",
                            actionTheme.footerBg
                        )}
                    >
                        <div className="flex gap-2">
                            <StatusBadge {...statusBadgeProps} />
                            <Badge className={cn(opTheme.bg, opTheme.color)}>
                                <Icon />
                                {opTheme.label}
                            </Badge>
                        </div>

                        {/* shrink-0 garante que a data e o menu não sejam esmagados */}
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
    },
    {
        id: "actions",
        cell: ({ row }) => <TransactionMenu actions={row.original.actions} transaction={row.original.transaction}/>,
        meta: {className: "pl-0"}
    }
]