"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AmountSpan } from "@/components/amount-span";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import {
    CYCLE_STATUS_TONE_MAP,
    STATUS_BADGE_CLASSES,
} from "@/modules/cycles/ui/components/cycle-summary/labels";

export const RECURRENCE_CYCLE_STATUS_LABELS: Record<string, string> = {
    OVERDUE: "Em atraso",
    PENDING: "Pendente",
    OPEN: "Aberta",
    PARTIAL: "Parcial",
    PAID: "Paga",
    SETTLED: "Liquidada",
    PROJECTED: "Projetada",
};

export function RecurrenceCycleStatusBadge({
    status,
    className,
}: {
    status: CycleItem["status"];
    className?: string;
}) {
    const toneInfo = CYCLE_STATUS_TONE_MAP[status] ?? {
        label: status,
        tone: "neutral" as const,
    };
    const badgeClass =
        STATUS_BADGE_CLASSES[toneInfo.tone] ?? STATUS_BADGE_CLASSES.neutral;
    const label = RECURRENCE_CYCLE_STATUS_LABELS[status] ?? toneInfo.label;

    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none transition-colors",
                badgeClass,
                className
            )}
        >
            {label}
        </span>
    );
}

export const RECURRENCE_CYCLE_COLUMNS: ColumnDef<CycleItem>[] = [
    {
        id: "validity",
        header: "Vigência",
        cell: ({ row }) => {
            const { from, to, dueDate, status } = row.original;
            const isOverdue = status === "OVERDUE";

            return (
                <div className="flex flex-col min-w-0 py-0.5">
                    <span className="truncate font-medium text-sm text-foreground">
                        {formatDate(from)} a {formatDate(to)}
                    </span>
                    <span
                        className={cn(
                            "truncate text-xs text-muted-foreground tabular-nums",
                            isOverdue && "text-rose-600 dark:text-rose-400 font-medium"
                        )}
                    >
                        {dueDate ? `Venc. ${formatDate(dueDate)}` : "Sem vencimento"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "cycle",
        header: "Ciclo",
        cell: ({ row }) => {
            const { label, status } = row.original;
            const isProjected = status === "PROJECTED";
            const statusLabel = RECURRENCE_CYCLE_STATUS_LABELS[status] ?? status;

            return (
                <div className="flex flex-col min-w-0 py-0.5">
                    <span
                        className={cn(
                            "truncate font-medium text-sm text-foreground",
                            isProjected && "text-muted-foreground/80 italic font-normal"
                        )}
                        title={label}
                    >
                        {label}
                    </span>
                    <span
                        className={cn(
                            "truncate text-xs text-muted-foreground",
                            status === "OVERDUE" &&
                                "text-rose-600 dark:text-rose-400 font-medium",
                            (status === "PAID" || status === "SETTLED") &&
                                "text-emerald-600 dark:text-emerald-400"
                        )}
                    >
                        {statusLabel}
                    </span>
                </div>
            );
        },
    },
    {
        id: "totalAmount",
        header: () => <div className="text-right">Valor Previsto</div>,
        accessorKey: "totalAmount",
        cell: ({ row }) => {
            const { totalAmount, paidAmount, status } = row.original;
            return (
                <div className="flex flex-col items-end min-w-0 py-0.5">
                    <AmountSpan
                        className="text-right"
                        amount={totalAmount}
                        isCancelled={status === "PROJECTED"}
                    />
                    <span className="truncate text-xs text-muted-foreground tabular-nums">
                        Pago: {formatMoney(paidAmount ?? 0)}
                    </span>
                </div>
            );
        },
    },
];
