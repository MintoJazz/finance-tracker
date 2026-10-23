import * as React from "react";
import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { AmountSpan } from "@/components/amount-span";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { ContractCycleItem } from "../../../../core/schemas/contract-cycle.schema";
import { CYCLE_STATUS_CONFIG } from "../contract-cycle-table/columns";

interface ContractCycleActionsDrawerHeaderProps {
    cycle: ContractCycleItem;
    isPayable: boolean;
}

export function ContractCycleActionsDrawerHeader({
    cycle,
    isPayable,
}: ContractCycleActionsDrawerHeaderProps) {
    const isProjected = cycle.kind === "PROJECTED";
    const statusConfig = CYCLE_STATUS_CONFIG[cycle.status] ?? {
        label: cycle.status,
        icon: Calendar,
        iconClassName: "text-muted-foreground",
    };
    const StatusIcon = statusConfig.icon;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <div
                    className={cn(
                        "flex size-10 items-center justify-center rounded-full border bg-muted/50",
                        isProjected
                            ? "border-dashed border-indigo-500/40"
                            : "border-border/60"
                    )}
                >
                    <StatusIcon className={cn("size-5", statusConfig.iconClassName)} />
                </div>
            </EntityHeaderMedia>

            <EntityHeaderContent>
                <div className="flex items-center gap-2">
                    <EntityHeaderTitle>{cycle.label}</EntityHeaderTitle>
                    {isProjected && (
                        <Badge
                            variant="outline"
                            className="border-dashed border-indigo-500/40 text-indigo-700 dark:text-indigo-300 bg-indigo-500/5 text-[10px] py-0 px-1.5 h-4 font-normal"
                        >
                            Projetado
                        </Badge>
                    )}
                </div>
                <EntityHeaderDescription className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono tabular-nums font-medium text-foreground">
                        <AmountSpan
                            amount={cycle.totalAmount}
                            isNegative={isPayable}
                            isPositive={!isPayable}
                        />
                    </span>
                    <span>•</span>
                    <span>Vence {formatDate(new Date(cycle.dueDate))}</span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}
