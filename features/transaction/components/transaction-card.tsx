import { ItemDescription, ItemTitle } from "@/components/ui/item"
import { Transaction } from "@/generated/prisma/client"
import { formatarData, formatarDinheiro } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { ActionTheme } from "../themes/action-themes"
import { OPERATION_THEMES } from "../themes/operation-themes"

interface Props {
    children: React.ReactNode
    actionTheme: ActionTheme
}

export default function TransactionCard({ children, actionTheme: actionConfig }: Props) {
    return <div className={cn("border rounded-2xl overflow-hidden transition-all duration-300 border-border shadow-sm", actionConfig.border)}>
        {children}
    </div>
}

interface CardInfoProps {
    transaction: Transaction
}

export function TransactionCardInfo({ transaction }: CardInfoProps) {
    const theme = OPERATION_THEMES[transaction.type]
    const Icon = theme.icon

    return <div className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-4">
            <div className="flex gap-3 min-w-0">
                <div className={cn("p-2 rounded-xl h-fit shrink-0", theme.bg, theme.color)}>
                    <Icon size={18} className={theme.color} />
                </div>
                <div className="min-w-0 flex flex-col justify-between">
                    <ItemTitle>{transaction.description}</ItemTitle>
                    <ItemDescription>{theme.label}</ItemDescription>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className={cn("text-xs font-black tracking-tight")}>
                    {formatarDinheiro(transaction.amount)}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                    {formatarData(transaction.date)}
                </p>
            </div>
        </div>
    </div>
}

export function TransactionCardFooter({ children, actionTheme }: Props) {
    return <div className={cn("px-4 py-1.5 border-t flex justify-between items-center transition-colors duration-500", actionTheme.border, actionTheme.footerBg)}>
        {children}
    </div>
}

export function TransactionCardFooterLeft({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center gap-4">
        {children}
    </div>
}

export function TransactionCardFooterRight({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center gap-2">
        {children}
    </div>
}
