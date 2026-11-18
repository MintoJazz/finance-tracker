"use client";

import { useMemo } from "react";
import { useRowGlobalActions } from "@/components/global-actions";
import type { RecurrenceProfile } from "@/modules/recurrences/models/schemas/recurrence-profile.schema";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    RECURRENCE_ACTIONS,
    type RecurrenceActionContext,
} from "../../../components/recurrence-actions-drawer/actions";

export interface RecurrenceProfileActionHandlers {
    onEdit?: () => void;
    onAdjustAmount?: () => void;
    onAdjustDeadlines?: () => void;
    onToggleActive?: () => void;
    onArchive?: () => void;
}

export function useRecurrenceProfileGlobalActions(
    profile: RecurrenceProfile | null,
    handlers: RecurrenceProfileActionHandlers
) {
    const { onEdit, onAdjustAmount, onAdjustDeadlines, onToggleActive, onArchive } = handlers;

    const context = useMemo<RecurrenceActionContext>(
        () => ({
            onEdit: () => onEdit?.(),
            onAdjustAmount: () => onAdjustAmount?.(),
            onAdjustDeadlines: () => onAdjustDeadlines?.(),
            onActivate: () => onToggleActive?.(),
            onDeactivate: () => onToggleActive?.(),
            onArchive: () => onArchive?.(),
        }),
        [onEdit, onAdjustAmount, onAdjustDeadlines, onToggleActive, onArchive]
    );

    useRowGlobalActions<RecurrenceListItem, RecurrenceActionContext>({
        actions: RECURRENCE_ACTIONS,
        row: profile as unknown as RecurrenceListItem | null,
        context,
    });
}
