"use client";

import * as React from "react";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AmountSpan } from "@/components/amount-span";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemSubtitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo,
} from "@/components/list-item";
import { ContractCycleItem } from "@/modules/cycles/models/contract-cycle.schema";
import { CYCLE_STATUS_CONFIG } from "../contract-cycle-table/columns";

interface ContractCycleListItemProps {
    cycle: ContractCycleItem;
    isPayable: boolean;
    onSelect?: () => void;
    onOpenActions?: () => void;
    className?: string;
}

export function ContractCycleListItem({
    cycle,
    isPayable,
    onSelect,
    onOpenActions,
    className,
}: ContractCycleListItemProps) {
    const isProjected = cycle.status === "PROJECTED";
    const statusConfig = CYCLE_STATUS_CONFIG[cycle.status] ?? {
        label: cycle.status,
        icon: Calendar,
        iconClassName: "text-muted-foreground",
    };
    const StatusIcon = statusConfig.icon;

    return (
        <ListItem
            onSelect={onSelect}
            className={cn(
                isProjected && "border-l-2 border-l-dashed border-l-indigo-400/60 bg-muted/10",
                className
            )}
        >
            <ListItemHeader>
                <ListItemAvatar>
                    <div
                        className={cn(
                            "flex size-9 items-center justify-center rounded-full border bg-muted/50",
                            isProjected
                                ? "border-dashed border-indigo-500/40"
                                : "border-border/60"
                        )}
                    >
                        <StatusIcon className={cn("size-4", statusConfig.iconClassName)} />
                    </div>
                </ListItemAvatar>

                <ListItemContent>
                    <ListItemTitle>
                        <span className="truncate font-medium text-foreground text-sm">
                            {cycle.label}
                        </span>
                        {isProjected && (
                            <Badge
                                variant="outline"
                                className="border-dashed border-indigo-500/40 text-indigo-700 dark:text-indigo-300 bg-indigo-500/5 text-[10px] py-0 px-1.5 h-4 font-normal"
                            >
                                Projetado
                            </Badge>
                        )}
                    </ListItemTitle>
                    <ListItemSubtitle>
                        {formatDate(new Date(cycle.from))} a {formatDate(new Date(cycle.to))}
                    </ListItemSubtitle>
                </ListItemContent>

                {onOpenActions && (
                    <ListItemActions>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenActions();
                            }}
                            aria-label={`Ações do ciclo ${cycle.label}`}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </ListItemActions>
                )}
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <ListItemFooterInfo icon={Calendar}>
                        Vence {formatDate(new Date(cycle.dueDate))}
                    </ListItemFooterInfo>
                    <ListItemFooterInfo
                        icon={StatusIcon}
                        className={statusConfig.iconClassName}
                    >
                        {statusConfig.label}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>

                <ListItemFooterRight>
                    <span className="font-medium font-mono tabular-nums text-foreground">
                        <AmountSpan
                            amount={cycle.totalAmount}
                            isNegative={isPayable}
                            isPositive={!isPayable}
                        />
                    </span>
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}

export default ContractCycleListItem;
