import { ItemTitle } from "@/components/ui/item"
import { Transaction } from "@/generated/prisma/client"
import { formatarData, formatarDinheiro } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { ActionConfig } from "./action-registry"

interface Props {
    children: React.ReactNode
    actionConfig: ActionConfig
}

export default function TransactionCard({ children, actionConfig }: Props) {
    return <div className={cn("border rounded-2xl overflow-hidden transition-all duration-300 border-border shadow-sm", actionConfig.border)}>
        {children}
    </div>
}

interface CardInfoProps {
    transaction: Transaction
}

export function TransactionCardInfo({ transaction }: CardInfoProps) {
    return <div className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-4">
            <div className="flex gap-3 min-w-0">
                <div className={cn("rounded-xl h-fit shrink-0 self-center")}>
                    <Plus />
                </div>
                <div className="min-w-0 flex flex-col justify-between">
                    <ItemTitle>{transaction.description}</ItemTitle>
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

export function TransactionCardFooter({ children, actionConfig }: Props) {
    return <div className={cn("px-4 py-1.5 border-t flex justify-between items-center transition-colors duration-500", actionConfig.border, actionConfig.footerBg)}>
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
