import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { formatarData, formatarDinheiro } from "@/lib/formatters"
import { OPERATION_THEMES } from "../themes/operation-styles"
import { TransactionRow } from "../hooks/use-transaction-features"
import StatusBadge from "./status-badge"
import TransactionMenu from "./transaction-menu"

interface Props {
    row: TransactionRow
}

/**
 * Card visual para a listagem mobile.
 * Renderiza dentro de uma <TableCell> do DataTable.
 * Toda a interação (checkbox, status, ações) continua vindo dos props do row.
 */
export default function TransactionMobileCard({ row }: Props) {
    const { transaction, actionTheme, checkboxProps, statusBadgeProps, actions } = row
    const opTheme = OPERATION_THEMES[transaction.type]

    return (
        <div className={"group relative overflow-hidden transition-all"} >
            {/* ── BODY ─────────────────────────────────────────────── */}
            <div className="flex w-full items-start gap-3 px-3 pb-3 pt-3">
                {/* Checkbox compacto à esquerda */}
                <div className="shrink-0 pt-1">
                    <Checkbox
                        {...checkboxProps}
                        aria-label="Selecionar transação"
                        className="size-4 opacity-60 transition-opacity group-hover:opacity-100 data-[state=checked]:opacity-100 rounded-md"
                    />
                </div>

                {/* A MÁGICA ESTÁ AQUI: w-0 flex-1 min-w-0
                  O w-0 impede que a tabela estique a tela para caber o texto.
                */}
                <div className="w-0 min-w-0 flex-1 pt-0.5">
                    <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                        {transaction.description}
                    </p>
                    <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {opTheme.label}
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
                    "flex w-full items-center justify-between px-3 py-1.5 transition-colors",
                    actionTheme.footerBg
                )}
            >
                <StatusBadge {...statusBadgeProps} />

                {/* shrink-0 garante que a data e o menu não sejam esmagados */}
                <div className="flex shrink-0 items-center gap-1.5">
                    <span className="tabular-nums text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {formatarData(transaction.date)}
                    </span>
                    <TransactionMenu actions={actions} transaction={transaction} />
                </div>
            </div>
        </div>
    )
}