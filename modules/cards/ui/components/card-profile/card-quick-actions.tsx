"use client";

import * as React from "react";
import { QuickActions } from "@/components/quick-actions";
import { CardProfile } from "@/modules/cards/models/card-profile.schema";
import { CardSummary } from "@/modules/cards/models/card.schema";
import {
    CARD_PROFILE_ACTIONS,
    CardActionContext,
    CardActionsDrawerHeader,
} from "../card-actions-drawer";

interface CardQuickActionsProps {
    card: CardProfile;
    cardActionsContext?: CardActionContext;
    className?: string;
}

export function CardQuickActions({
    card,
    cardActionsContext,
    className,
}: CardQuickActionsProps) {
    const cardSummary = React.useMemo<CardSummary>(
        () => ({
            id: card.id,
            name: card.name,
            limit: card.limit,
            usedLimit: card.usedLimit,
            availableLimit: card.availableLimit,
            closingDay: card.closingDay,
            dueDay: card.dueDay,
            lastActivityAt: null,
            isArchived: card.isArchived,
        }),
        [card]
    );

    return (
        <QuickActions
            row={cardSummary}
            actions={CARD_PROFILE_ACTIONS}
            context={cardActionsContext}
            optionsHeader={<CardActionsDrawerHeader card={cardSummary} />}
            className={className}
        />
    );
}

export default CardQuickActions;
