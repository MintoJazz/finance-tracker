import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CardLimitProgressProps {
    limit: number;
    usedLimit: number;
    isVisible: boolean;
    className?: string;
}

export function CardLimitProgress({
    limit,
    usedLimit,
    isVisible,
    className,
}: CardLimitProgressProps) {
    const percentage =
        limit > 0 ? Math.min(100, Math.max(0, Math.round((usedLimit / limit) * 100))) : 0;

    const isHighUsage = percentage >= 85;

    return (
        <div className={cn("flex flex-col gap-1.5 pt-1", className)}>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isHighUsage
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>
                    Usado:{" "}
                    <strong className="font-medium text-foreground">
                        {isVisible ? formatMoney(usedLimit) : "R$ ••••"}
                    </strong>
                </span>
                <span>
                    Total:{" "}
                    <strong className="font-medium text-foreground">
                        {isVisible ? formatMoney(limit) : "R$ ••••"}
                    </strong>
                </span>
            </div>
        </div>
    );
}