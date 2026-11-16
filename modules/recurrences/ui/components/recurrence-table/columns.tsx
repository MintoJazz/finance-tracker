"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AmountSpan } from "@/components/amount-span";
import { cn } from "@/lib/utils";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    formatRecurrenceDue,
    RECURRENCE_FREQUENCY_LABELS,
} from "@/modules/recurrences/ui/themes/recurrence.themes";
import { RecurrenceAvatar } from "../recurrence-avatar";
import { RecurrenceStatusBadge } from "../recurrence-status-badge";

export const RECURRENCE_COLUMNS: ColumnDef<RecurrenceListItem>[] = [
    {
        id: "name",
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <RecurrenceAvatar item={item} size="md" />
                    <div className="flex flex-col min-w-0">
                        <span
                            className={cn(
                                "truncate font-medium text-foreground",
                                !item.isActive && "text-muted-foreground"
                            )}
                            title={item.name}
                        >
                            {item.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {item.category?.name ?? "Sem categoria"}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        id: "frequency",
        header: "Frequência",
        accessorKey: "frequency",
        cell: ({ row }) => {
            const { frequency } = row.original;
            return (
                <span className="text-muted-foreground text-sm">
                    {RECURRENCE_FREQUENCY_LABELS[frequency]}
                </span>
            );
        },
    },
    {
        id: "dueDay",
        header: "Vencimento",
        accessorKey: "dueDay",
        cell: ({ row }) => {
            return (
                <span className="text-muted-foreground text-sm tabular-nums">
                    {formatRecurrenceDue(row.original)}
                </span>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => <RecurrenceStatusBadge item={row.original} />,
    },
    {
        id: "currentAmount",
        header: () => <div className="text-right">Valor</div>,
        accessorKey: "currentAmount",
        cell: ({ row }) => {
            const { currentAmount, direction, isActive } = row.original;
            return (
                <AmountSpan
                    className="text-right"
                    amount={currentAmount}
                    isPositive={isActive && direction === "CREDIT"}
                    isNegative={isActive && direction === "DEBIT"}
                    isCancelled={!isActive}
                />
            );
        },
    },
];

