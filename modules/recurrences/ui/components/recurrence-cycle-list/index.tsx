"use client";

import React, { useState } from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import {
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import {
    RECURRENCE_CYCLE_ACTIONS,
    type RecurrenceCycleActionContext,
} from "../recurrence-cycle-table/actions";
import RecurrenceCycleListItem from "./list-item";
import EmptyRecurrenceCycleList from "./empty";

export interface RecurrenceCycleListProps {
    cycles: CycleItem[];
    actionContext?: RecurrenceCycleActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    onSelectCycle?: (cycle: CycleItem) => void;
    onOpenCycleActions?: (cycle: CycleItem) => void;
    className?: string;
}

export function RecurrenceCycleList({
    cycles,
    actionContext,
    hasFilters = false,
    onClearFilters,
    onSelectCycle,
    onOpenCycleActions,
    className,
}: RecurrenceCycleListProps) {
    const [activeCycle, setActiveCycle] = useState<CycleItem | null>(null);

    if (cycles.length === 0) {
        return (
            <div className={cn("w-full px-4", className)}>
                <EmptyRecurrenceCycleList
                    hasFilters={hasFilters}
                    onClearFilters={onClearFilters}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border/60 border-b border-border/60",
                className
            )}
        >
            {cycles.map((cycle) => (
                <RecurrenceCycleListItem
                    key={`${cycle.from}_${cycle.to}_${cycle.label}`}
                    cycle={cycle}
                    onSelect={() => onSelectCycle?.(cycle)}
                    onOpenActions={() => {
                        if (onOpenCycleActions) {
                            onOpenCycleActions(cycle);
                        } else {
                            setActiveCycle(cycle);
                        }
                    }}
                />
            ))}

            {/* Drawer de Ações do Ciclo Selecionado */}
            <ActionsDrawer
                open={Boolean(activeCycle)}
                onOpenChange={(open) => {
                    if (!open) setActiveCycle(null);
                }}
                row={activeCycle ?? undefined}
                actions={RECURRENCE_CYCLE_ACTIONS}
                context={actionContext}
                header={
                    activeCycle ? (
                        <DrawerHeader className="text-left px-5 pt-4 pb-2 border-b border-border/40">
                            <DrawerTitle className="text-base font-semibold">
                                {activeCycle.label}
                            </DrawerTitle>
                            <DrawerDescription className="text-xs text-muted-foreground">
                                Período: {formatDate(activeCycle.from)} a{" "}
                                {formatDate(activeCycle.to)}
                            </DrawerDescription>
                        </DrawerHeader>
                    ) : null
                }
            />
        </div>
    );
}

export default RecurrenceCycleList;
