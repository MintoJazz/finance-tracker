"use client";

import React from "react";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    CircleDot,
    Clock,
    MoreHorizontal,
} from "lucide-react";
import { AmountSpan } from "@/components/amount-span";
import { Button } from "@/components/ui/button";
import {
    ListItem,
    ListItemActions,
    ListItemContent,
    ListItemFooter,
    ListItemFooterInfo,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemHeader,
    ListItemSubtitle,
    ListItemTitle,
} from "@/components/list-item";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import { RECURRENCE_CYCLE_STATUS_LABELS } from "../recurrence-cycle-table/columns";

export interface RecurrenceCycleListItemProps {
    cycle: CycleItem;
    onSelect?: () => void;
    onOpenActions?: () => void;
    className?: string;
}

function getCycleStatusIcon(status: CycleItem["status"]) {
    switch (status) {
        case "PAID":
        case "SETTLED":
            return CheckCircle2;
        case "OVERDUE":
            return AlertCircle;
        case "PARTIAL":
        case "PENDING":
        case "OPEN":
            return Clock;
        default:
            return CircleDot;
    }
}

export function RecurrenceCycleListItem({
    cycle,
    onSelect,
    onOpenActions,
    className,
}: RecurrenceCycleListItemProps) {
    const {
        label,
        from,
        to,
        dueDate,
        totalAmount,
        status,
    } = cycle;
    const isProjected = status === "PROJECTED";
    const isOverdue = status === "OVERDUE";
    const isPaid = status === "PAID" || status === "SETTLED";
    const statusLabel = RECURRENCE_CYCLE_STATUS_LABELS[status] ?? status;
    const StatusIcon = getCycleStatusIcon(status);

    return (
        <ListItem
            onSelect={onSelect}
            className={cn(isProjected && "opacity-80 italic", className)}
        >
            <ListItemHeader>
                <ListItemContent>
                    <ListItemTitle>
                        <span
                            className={cn(
                                "truncate font-medium text-foreground text-sm",
                                isProjected && "font-normal"
                            )}
                            title={label}
                        >
                            {label}
                        </span>
                    </ListItemTitle>
                    <ListItemSubtitle>
                        {formatDate(from)} a {formatDate(to)}
                    </ListItemSubtitle>
                </ListItemContent>

                {onOpenActions && (
                    <ListItemActions>
                        <Button
                            type="button"
                            variant="ghost"
                            className="size-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenActions();
                            }}
                            aria-label={`Ações do ciclo ${label}`}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </ListItemActions>
                )}
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    {/* 1ª info: Vencimento */}
                    <ListItemFooterInfo icon={Calendar}>
                        <span
                            className={cn(
                                isOverdue &&
                                    "text-rose-600 dark:text-rose-400 font-medium"
                            )}
                        >
                            {dueDate ? `Venc. ${formatDate(dueDate)}` : "Sem vencimento"}
                        </span>
                    </ListItemFooterInfo>

                    {/* 2ª info: Status do ciclo */}
                    <ListItemFooterInfo icon={StatusIcon}>
                        <span
                            className={cn(
                                isPaid &&
                                    "text-emerald-600 dark:text-emerald-400 font-medium",
                                isOverdue &&
                                    "text-rose-600 dark:text-rose-400 font-medium",
                                status === "PARTIAL" &&
                                    "text-amber-600 dark:text-amber-400 font-medium"
                            )}
                        >
                            {statusLabel}
                        </span>
                    </ListItemFooterInfo>
                </ListItemFooterLeft>

                <ListItemFooterRight>
                    <AmountSpan
                        amount={totalAmount}
                        isCancelled={isProjected}
                    />
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}

export default RecurrenceCycleListItem;
