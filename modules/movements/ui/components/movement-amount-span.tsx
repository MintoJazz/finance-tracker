import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface MovementAmountSpanProps {
    amount: number; // Inteiro em centavos (sempre positivo)
    direction: "CREDIT" | "DEBIT";
    isReversed?: boolean;
    className?: string;
}

export function MovementAmountSpan({
    amount,
    direction,
    isReversed = false,
    className,
}: MovementAmountSpanProps) {
    const isCredit = direction === "CREDIT";
    const prefix = isCredit ? "+ " : "- ";

    return (
        <span
            className={cn(
                "tabular-nums font-mono font-medium text-sm transition-colors",
                isCredit && "text-emerald-600 dark:text-emerald-400",
                !isCredit && "text-rose-600 dark:text-rose-400",
                isReversed && "line-through opacity-60 text-muted-foreground",
                className
            )}
        >
            {prefix}
            {formatMoney(amount)}
        </span>
    );
}
