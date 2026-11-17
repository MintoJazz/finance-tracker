"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import type { RowAction } from "@/types/actions.types";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import { RECURRENCE_ACTIONS, type RecurrenceActionContext } from "./actions";
import { RecurrenceActionsDrawerHeader } from "./header";

export interface RecurrenceActionsDrawerProps {
    recurrence?: RecurrenceListItem | null;
    context?: RecurrenceActionContext;
    actions?: RowAction<RecurrenceListItem, RecurrenceActionContext>[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function RecurrenceActionsDrawer({
    recurrence,
    context,
    actions = RECURRENCE_ACTIONS,
    open,
    onOpenChange,
    trigger = null,
}: RecurrenceActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={recurrence ?? undefined}
            actions={actions}
            context={context}
            trigger={trigger}
            header={
                recurrence ? (
                    <RecurrenceActionsDrawerHeader recurrence={recurrence} />
                ) : null
            }
        />
    );
}

export default RecurrenceActionsDrawer;
export * from "./actions";
export * from "./header";

