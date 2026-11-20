import { CircularProgress } from "@/components/ui/circular-progress";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    getInstallmentStatus,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";

export interface InstallmentProgressProps {
    item: Pick<
        InstallmentListItem,
        "paidInstallments" | "totalInstallments" | "isOverdue"
    >;
    className?: string;
}

/** Barra de progresso com o contador "pagas/total". */
export function InstallmentProgress({
    item,
    className,
}: InstallmentProgressProps) {
    const status = getInstallmentStatus(item);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Progress
                value={item.paidInstallments}
                max={item.totalInstallments}
                className="w-20 sm:w-24"
                trackClassName="h-1.5"
                indicatorClassName={cn(
                    status === "OVERDUE" && "bg-rose-500",
                    status === "PAID" && "bg-emerald-500"
                )}
                aria-label={`${item.paidInstallments} de ${item.totalInstallments} parcelas`}
            />
            <span className="text-xs tabular-nums text-muted-foreground">
                {item.paidInstallments}/{item.totalInstallments}
            </span>
        </div>
    );
}

/** Versão compacta (mobile): anel de progresso + "pagas/total", para o footer dos itens. */
export function InstallmentProgressRing({
    item,
    className,
}: InstallmentProgressProps) {
    const status = getInstallmentStatus(item);

    return (
        <div className={cn("flex items-center gap-1.5 min-w-0", className)}>
            <CircularProgress
                value={item.paidInstallments}
                max={item.totalInstallments}
                size={16}
                indicatorClassName={cn(
                    status === "OVERDUE" && "stroke-rose-500",
                    status === "PAID" && "stroke-emerald-500"
                )}
                aria-label={`${item.paidInstallments} de ${item.totalInstallments} parcelas`}
            />
            <span className="tabular-nums">
                {item.paidInstallments}/{item.totalInstallments}
            </span>
        </div>
    );
}
