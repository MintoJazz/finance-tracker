"use client"
import { cn } from "@/lib/utils"
import { formatDate, formatMoney } from "@/lib/formatters"
import { OPERATION_THEMES } from "../themes/operation-themes"
import StatusBadge from "../components/status-badge"
import { RowAction } from "@/components/ui/data-table"
import { TransactionDetails } from "@/types/database"
import { MouseEvent } from "react"
import { TransactionStatus } from "@/generated/prisma/enums"
import { ActionsMenu } from "@/components/actions-menu"

interface Props {
    transaction: TransactionDetails
    actions?: RowAction<TransactionDetails>[]
    isSelected?: boolean
    onSelect?: (id: number) => void
    onStatusChange: (id: number, status: TransactionStatus) => void
}

export function TransactionListItem({ transaction, actions, isSelected, onSelect, onStatusChange }: Props) {
    const theme = OPERATION_THEMES[transaction.type]
    const Icon = theme.icon

    const statusBadgeProps = {
        onClick: (status: TransactionStatus) => onStatusChange(transaction.id, status),
        current: transaction.status
    }

    const dateStr = formatDate(transaction.date)
    const onClick = (e: MouseEvent) => {
        e.stopPropagation();
        onSelect?.(transaction.id)
    }

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/60",
                isSelected ? "bg-muted/50" : "hover:bg-muted/40",
                onSelect && "cursor-pointer"
            )}
            onClick={() => onSelect?.(transaction.id)}
        >
            {/* Ícone / Checkbox */}
            <div
                className={cn(
                    "shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
                )}
                onClick={onClick}
            >
                <Icon size={16} className={theme.color} />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
                {/* Linha 1: descrição + valor */}
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate leading-snug">
                        {transaction.description}
                    </p>
                    <span className={cn(
                        "shrink-0 text-sm font-semibold font-mono tabular-nums leading-snug",
                        theme.color
                    )}>
                        {formatMoney(transaction.amount)}
                    </span>
                </div>

                {/* Linha 2: metadados */}
                <div
                    className="flex items-center gap-1.5 mt-0.5"
                    onClick={e => e.stopPropagation()}
                >
                    <StatusBadge {...statusBadgeProps} />
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {dateStr}
                    </span>
                </div>
            </div>

            {/* Menu de ações genérico */}
            <ActionsMenu 
                actions={actions} 
                data={transaction} 
                className="-mr-1" 
            />
        </div>
    )
}