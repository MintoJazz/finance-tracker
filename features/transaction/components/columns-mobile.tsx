import { ColumnDef } from "@tanstack/react-table"
import { OPERATION_THEMES } from "../themes/operation-styles"
import { cn } from "@/lib/utils"
import { formatarData, formatarDinheiro } from "@/lib/formatters"
import StatusBadge from "./status-badge"
import TransactionMenu from "./transaction-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionRow } from "../hooks/use-transaction-features"

export const mobileColumns: ColumnDef<TransactionRow>[] = [
    {
        id: "row",
        cell: ({ row }) => {
            const { transaction } = row.original
            const theme = OPERATION_THEMES[transaction.type]
            const Icon = theme.icon

            return (
                // 1. Redução do gap de 5 para 2.5 e adição de w-full
                <div className="flex items-center gap-2.5 px-1 py-1 w-full">
                    
                    {/* 2. Checkbox: shrink-0 impede que ele seja esmagado */}
                    <div className="shrink-0 flex items-center">
                        <Checkbox 
                            {...row.original.checkboxProps} 
                            aria-label="Selecionar linha" 
                        />
                    </div>

                    {/* 3. Ícone: Padding levemente reduzido (p-1.5) e ícone menor (16) para ganhar espaço */}
                    <div className={cn("p-1.5 rounded-xl h-fit shrink-0", theme.bg, theme.color)}>
                        <Icon size={16} className={theme.color} />
                    </div>

                    {/* 4. Descrição e Status: flex-1 faz ocupar o espaço restante, min-w-0 permite o truncate funcionar */}
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                        <span className="truncate w-full text-sm font-medium leading-tight">
                            {transaction.description}
                        </span>
                        <StatusBadge {...row.original.statusBadgeProps} />
                    </div>

                    {/* 5. Valores: shrink-0 para fixar na direita */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={cn(
                            "text-sm font-semibold tabular-nums leading-tight",
                            theme.color
                        )}>
                            {formatarDinheiro(transaction.amount)}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums leading-tight">
                            {formatarData(transaction.date)}
                        </span>
                    </div>

                    {/* 6. Menu (...): shrink-0. Uma margem negativa (-mr-1) encosta ele mais na borda */}
                    <div className="shrink-0 flex items-center">
                        <TransactionMenu 
                            actions={row.original.actions} 
                            transaction={row.original.transaction} 
                        />
                    </div>
                </div>
            )
        },
    },
]