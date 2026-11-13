"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { MovementEntry } from "@/modules/movements/models/movement-entry.schema";
import type { RowAction, RowLike } from "@/types/actions.types";
import { Info, Receipt, RotateCcw } from "lucide-react";
import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { MovementEntryAvatar } from "./movement-entry-avatar";
import { MovementEntryAmount } from "./movement-entry-amount";
import { formatDate } from "@/lib/formatters";

export interface MovementEntryActionContext {
    onViewDetails?: (entry: MovementEntry) => void;
    onViewReceipt?: (entry: MovementEntry) => void;
    onReverse?: (entry: MovementEntry) => void;
}

const getEntry = (row: RowLike<MovementEntry>): MovementEntry =>
    "original" in row ? row.original : row;

export const MOVEMENT_ENTRY_ACTIONS: RowAction<
    MovementEntry,
    MovementEntryActionContext
>[] = [
    {
        id: "view-details",
        label: "Ver detalhes",
        icon: Info,
        onClick: (row, context) => context?.onViewDetails?.(getEntry(row)),
    },
    {
        id: "view-receipt",
        label: "Ver comprovante",
        icon: Receipt,
        hidden: (row) => !getEntry(row).hasAttachment,
        onClick: (row, context) => context?.onViewReceipt?.(getEntry(row)),
    },
    {
        id: "reverse",
        label: "Estornar lançamento",
        icon: RotateCcw,
        variant: "destructive",
        hidden: (row, context) => !context?.onReverse || getEntry(row).isReversed,
        onClick: (row, context) => context?.onReverse?.(getEntry(row)),
    },
];

export interface MovementEntryActionsDrawerProps {
    entry?: MovementEntry | null;
    context?: MovementEntryActionContext;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function MovementEntryActionsDrawer({
    entry,
    context,
    open,
    onOpenChange,
    trigger,
}: MovementEntryActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={entry ?? undefined}
            actions={MOVEMENT_ENTRY_ACTIONS}
            context={context}
            trigger={trigger}
            header={
                entry ? (
                    <EntityHeader>
                        <EntityHeaderMedia>
                            <MovementEntryAvatar entry={entry} size="md" />
                        </EntityHeaderMedia>
                        <EntityHeaderContent>
                            <EntityHeaderTitle>{entry.description}</EntityHeaderTitle>
                            <EntityHeaderDescription className="flex items-center gap-3 mt-0.5">
                                <MovementEntryAmount entry={entry} scope="WALLET" />
                                <span>{formatDate(new Date(entry.date))}</span>
                                {entry.isReversed && <span>Estornada</span>}
                            </EntityHeaderDescription>
                        </EntityHeaderContent>
                    </EntityHeader>
                ) : null
            }
        />
    );
}

export default MovementEntryActionsDrawer;

