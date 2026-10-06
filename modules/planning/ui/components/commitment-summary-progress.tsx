import { AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CommitmentsPeriodSummary } from "../../core/schemas/commitment-cycle.schema";

interface CommitmentSummaryProgressProps {
    summary: CommitmentsPeriodSummary;
    isVisible: boolean;
    className?: string;
}

export function CommitmentSummaryProgress({
    summary,
    isVisible,
    className,
}: CommitmentSummaryProgressProps) {
    const { totalAmount, paidAmount, overdueCount, overdueAmount } = summary;
    const percentage =
        totalAmount > 0
            ? Math.min(100, Math.max(0, Math.round((paidAmount / totalAmount) * 100)))
            : 0;

    return (
        <div className={cn("flex flex-col gap-2 pt-1", className)}>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>
                    Pago:{" "}
                    <strong className="font-medium text-foreground">
                        {isVisible ? formatMoney(paidAmount) : "R$ ••••"}
                    </strong>
                </span>
                <span>
                    Total:{" "}
                    <strong className="font-medium text-foreground">
                        {isVisible ? formatMoney(totalAmount) : "R$ ••••"}
                    </strong>
                </span>
            </div>

            {overdueCount > 0 && (
                <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span className="truncate font-medium">
                            {overdueCount}{" "}
                            {overdueCount === 1
                                ? "compromisso vencido"
                                : "compromissos vencidos"}
                        </span>
                    </div>
                    <span className="font-mono font-semibold tabular-nums shrink-0">
                        {isVisible ? formatMoney(overdueAmount) : "R$ ••••"}
                    </span>
                </div>
            )}
        </div>
    );
}