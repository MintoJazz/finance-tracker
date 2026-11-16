import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    getRecurrenceStatus,
    type RecurrenceItemStatus,
    type RecurrenceListItem,
} from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import { RECURRENCE_STATUS_THEMES } from "@/modules/recurrences/ui/themes/recurrence.themes";

export interface RecurrenceStatusBadgeProps {
    item?: Pick<RecurrenceListItem, "isActive" | "isOverdue"> & {
        status?: RecurrenceItemStatus;
    };
    status?: RecurrenceItemStatus;
    className?: string;
}

export function RecurrenceStatusBadge({
    item,
    status: explicitStatus,
    className,
}: RecurrenceStatusBadgeProps) {
    const status = explicitStatus ?? (item ? getRecurrenceStatus(item) : null);

    if (!status || status === "ACTIVE") {
        return null;
    }

    const theme = RECURRENCE_STATUS_THEMES[status];
    if (!theme) {
        return null;
    }

    return (
        <Badge
            variant="outline"
            className={cn(theme.badgeClassName, className)}
        >
            {theme.label}
        </Badge>
    );
}

