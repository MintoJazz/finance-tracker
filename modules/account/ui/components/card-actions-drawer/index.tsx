"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { RowAction } from "@/types/actions.types";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { CARD_ACTIONS, CardActionContext } from "./actions";
import { CardActionsDrawerHeader } from "./header";

export interface CardActionsDrawerProps {
    card?: CardSummary | null;
    context?: CardActionContext;
    actions?: RowAction<CardSummary, CardActionContext>[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function CardActionsDrawer({
    card,
    context,
    actions = CARD_ACTIONS,
    open,
    onOpenChange,
    trigger,
}: CardActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={card ?? undefined}
            actions={actions}
            context={context}
            trigger={trigger}
            header={card ? <CardActionsDrawerHeader card={card} /> : null}
        />
    );
}

export default CardActionsDrawer;
export * from "./actions";
export * from "./header";