"use client"
import { cn } from "@/lib/utils"
import { formatarData, formatMoney } from "@/lib/formatters"
import { OPERATION_THEMES } from "../themes/operation-themes"
import StatusBadge from "./status-badge"
import { TransactionRow } from "../hooks/use-transaction-features"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { RowAction } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Row } from "@tanstack/react-table"

interface Props {
    row: TransactionRow
    actions?: RowAction<TransactionRow>[]
    isSelected?: boolean
    selectionMode?: boolean   // ≥1 item selecionado: mostra checkbox em todos
    onToggle?: (id: number) => void
    shortDate?: boolean
}

export function TransactionMobileItem({
    row, actions, isSelected, selectionMode, onToggle, shortDate = false
}: Props) {
    const { transaction, statusBadgeProps } = row
    const theme = OPERATION_THEMES[transaction.type]
    const Icon = theme.icon

    const dateStr = shortDate
        ? formatarData(transaction.date).slice(0, 5)
        : formatarData(transaction.date)

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/60",
                isSelected ? "bg-muted/50" : "hover:bg-muted/40",
                onToggle && "cursor-pointer"
            )}
            onClick={() => onToggle?.(transaction.id)}
        >
            {/* Ícone / Checkbox */}
            <div
                className={cn(
                    "shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
                    // Em modo seleção o fundo some e vira apenas checkbox
                    selectionMode ? "bg-transparent" : theme.bg
                )}
                onClick={e => { e.stopPropagation(); onToggle?.(transaction.id) }}
            >
                {selectionMode
                    ? <Checkbox checked={isSelected} className="pointer-events-none" />
                    : <Icon size={16} className={theme.color} />
                }
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

            {/* Menu de ações */}
            {actions && actions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-muted-foreground -mr-1"
                            onClick={e => e.stopPropagation()}
                        >
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {actions.map((action, i) => (
                            <DropdownMenuItem
                                key={i}
                                onSelect={() => action.onClick({ original: row } as Row<TransactionRow>)}
                            >
                                {action.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}