// modules/planning/ui/components/commitment-cycle-table/columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, FileText } from "lucide-react";
import { AmountSpan } from "@/components/amount-span";
import { BalanceAvatar } from "@/components/balance-avatar";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    COMMITMENT_SOURCE_TYPE_REGISTRY,
    COMMITMENT_STATUS_REGISTRY,
} from "../../../core/registries/commitment-cycle.registry";
import { CommitmentCycleItem } from "../../../core/schemas/commitment-cycle.schema";

export const COMMITMENT_CYCLE_COLUMNS: ColumnDef<CommitmentCycleItem>[] = [
    {
        accessorKey: "dueDate",
        size: 115,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Vencimento" />
        ),
        cell: ({ row }) => {
            const { dueDate, status } = row.original;
            const { label, badgeClassName } = COMMITMENT_STATUS_REGISTRY[status];
            const isOverdue = status === "OVERDUE";

            return <div className="flex flex-col">
                <span
                    className={cn(
                        "font-mono text-xs tabular-nums whitespace-nowrap",
                        isOverdue
                            ? "font-semibold text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                    )}
                >
                    {formatDate(dueDate)}
                </span>

                <span className={cn("text-xs", badgeClassName)}>{label}</span>
            </div>
        },
    },
    {
        accessorKey: "balanceName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Compromisso" />
        ),
        cell: ({ row }) => {
            const { balanceName, balanceType, label } = row.original;
            const sourceMeta = COMMITMENT_SOURCE_TYPE_REGISTRY[balanceType];
            const SourceIcon =
                balanceType === "CREDIT" ? CreditCard : FileText;

            return (
                <div className="flex items-center gap-3 min-w-0">
                    <BalanceAvatar name={balanceName} size="sm" />
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground text-sm truncate">
                            {balanceName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                            <SourceIcon className="size-3 shrink-0" />
                            <span>{sourceMeta.shortLabel}</span>
                            <span>•</span>
                            <span>{label}</span>
                        </div>
                    </div>
                </div>
            );
        },
    },
    // {
    //     accessorKey: "status",
    //     size: 120,
    //     header: "Status",
    //     cell: ({ row }) => {

    //         return (
    //             <Badge
    //                 variant="outline"
    //                 className={cn("text-xs font-medium", meta.badgeClassName)}
    //             >
    //                 {meta.label}
    //             </Badge>
    //         );
    //     },
    // },
    {
        accessorKey: "remainingAmount",
        size: 150,
        meta: {
            headerClassName: "text-right",
            cellClassName: "text-right",
        },
        header: "Valor",
        cell: ({ row }) => {
            const { status, totalAmount, paidAmount, remainingAmount } =
                row.original;
            const isPaid = status === "PAID";
            const isPartial = status === "PARTIAL";
            const displayAmount = isPaid ? totalAmount : remainingAmount;

            return (
                <div className="flex flex-col items-end justify-center">
                    <AmountSpan
                        amount={displayAmount}
                        isPositive={isPaid}
                        isNegative={status === "OVERDUE"}
                    />
                    {isPartial && (
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                            Pago {formatMoney(paidAmount)} de{" "}
                            {formatMoney(totalAmount)}
                        </span>
                    )}
                </div>
            );
        },
    },
];