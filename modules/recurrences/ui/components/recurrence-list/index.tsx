"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Page } from "@/types/pagination.types";
import type { RecurrenceListItem as RecurrenceListItemType } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    RecurrenceActionsDrawer,
    type RecurrenceActionContext,
} from "../recurrence-actions-drawer";
import EmptyRecurrenceList from "./empty";
import RecurrenceListItem from "./list-item";

interface Props {
    data: Page<RecurrenceListItemType> | RecurrenceListItemType[];
    actionContext: RecurrenceActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export default function RecurrenceList({
    data,
    actionContext,
    hasFilters = false,
    onClearFilters,
    className,
}: Props) {
    const items = Array.isArray(data) ? data : data.data;
    const [activeRecurrence, setActiveRecurrence] =
        useState<RecurrenceListItemType | null>(null);

    if (items.length === 0) {
        return (
            <div className={cn("px-4", className)}>
                <EmptyRecurrenceList
                    hasFilters={hasFilters}
                    onClearFilters={onClearFilters}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border border-y border-border",
                className
            )}
        >
            {items.map((recurrence) => (
                <RecurrenceListItem
                    key={recurrence.balanceId}
                    recurrence={recurrence}
                    onSelect={
                        actionContext.onView
                            ? () => actionContext.onView?.(recurrence)
                            : undefined
                    }
                    onOpenActions={() => setActiveRecurrence(recurrence)}
                />
            ))}

            <RecurrenceActionsDrawer
                open={Boolean(activeRecurrence)}
                onOpenChange={(open) => {
                    if (!open) setActiveRecurrence(null);
                }}
                recurrence={activeRecurrence}
                context={actionContext}
                trigger={null}
            />
        </div>
    );
}

