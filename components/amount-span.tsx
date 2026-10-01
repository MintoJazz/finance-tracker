import { formatMoney } from "@/lib/formatters";
import { cn } from "cn";

interface Props {
    amount: number
    isCancelled?: boolean
    isPositive?: boolean
    isNegative?: boolean
}

export function AmountSpan({ amount, isCancelled, isPositive, isNegative }: Props) {
    return <span className={cn(
        "tabular-nums font-mono font-medium",
        isCancelled && "text-muted-foreground",
        isPositive && "text-emerald-500/90",
        isNegative && "text-rose-500/90"
    )}> 
        {formatMoney(amount)}
    </span>
}