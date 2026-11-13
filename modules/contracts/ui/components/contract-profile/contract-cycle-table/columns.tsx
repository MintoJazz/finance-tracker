"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { AmountSpan } from "@/components/amount-span";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    ContractCycleItem,
    ContractCycleStatusEnum,
} from "@/modules/cycles/models/contract-cycle.schema";

export const CYCLE_STATUS_CONFIG: Record<
    ContractCycleStatusEnum,
    {
        label: string;
        icon: typeof CheckCircle2 | typeof Sparkles;
        iconClassName: string;
    }
> = {
    PROJECTED: {
        label: "Projetado",
        icon: Sparkles,
        iconClassName: "text-indigo-600 dark:text-indigo-400",
    },
    PAID: {
        label: "Pago",
        icon: CheckCircle2,
        iconClassName: "text-emerald-600 dark:text-emerald-400",
    },
    PARTIAL: {
        label: "Parcial",
        icon: Clock,
        iconClassName: "text-amber-600 dark:text-amber-400",
    },
    OVERDUE: {
        label: "Vencido",
        icon: AlertTriangle,
        iconClassName: "text-rose-600 dark:text-rose-400",
    },
    PENDING: {
        label: "Pendente",
        icon: Clock,
        iconClassName: "text-sky-600 dark:text-sky-400",
    },
    OPEN: {
        label: "Em aberto",
        icon: Clock,
        iconClassName: "text-muted-foreground",
    },
    TRANSFERRED: {
        label: "Transferido",
        icon: Sparkles,
        iconClassName: "text-indigo-600 dark:text-indigo-400",
    },
    SETTLED: {
        label: "Liquidado",
        icon: CheckCircle2,
        iconClassName: "text-emerald-600 dark:text-emerald-400",
    },
    UNRECORDED: {
        label: "Não registrado",
        icon: Clock,
        iconClassName: "text-muted-foreground",
    },
};

export const CONTRACT_CYCLE_COLUMNS: ColumnDef<ContractCycleItem>[] = [
    {
        accessorKey: "dueDate",
        header: "Vencimento",
        cell: ({ row }) => {
            const cycle = row.original;
            const config = CYCLE_STATUS_CONFIG[cycle.status] ?? {
                label: cycle.status,
                icon: Clock,
                iconClassName: "text-muted-foreground",
            };

            const dueDate = new Date(cycle.dueDate);

            return (
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(dueDate)}
                        </span>
                        <span className={cn("truncate", )}>
                        </span>
                    </div>
                    <span className={cn("text-xs text-muted-foreground truncate", config.iconClassName)}>
                        {config.label}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "label",
        header: "Competência",
        cell: ({ row }) => {
            const cycle = row.original;
            return (
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-sm text-foreground truncate">
                            {cycle.label}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                        {cycle.from === cycle.to
                            ? formatDate(cycle.from)
                            : `${formatDate(cycle.from)} a ${formatDate(cycle.to)}`}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => {
            const cycle = row.original;
            return (
                <div className="flex flex-col items-end">
                    <span className="font-medium font-mono tabular-nums text-sm">
                        <AmountSpan amount={cycle.totalAmount} />
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {(cycle.paidAmount > 0) && `Pago: ${formatMoney(cycle.paidAmount)}`}
                    </span>
                </div>
            );
        },
    },
];
