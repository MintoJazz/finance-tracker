"use client";

import { useState } from "react";
import { Page } from "@/types/pagination.types";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import {
    CardActionContext,
    CardActionsDrawer,
} from "../card-actions-drawer";
import CardListItem from "./list-item";
import EmptyCardList from "./empty";
import { cn } from "cn";

interface Props {
    data: Page<CardSummary> | CardSummary[];
    actionContext: CardActionContext;
    className?: string;
}

export default function CardList({ data, actionContext, className }: Props) {
    const items = Array.isArray(data) ? data : data.data;
    const [activeCard, setActiveCard] = useState<CardSummary | null>(null);

    if (items.length === 0) {
        return (
            <div className={cn("px-4", className)}>
                <EmptyCardList />
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
            {items.map((card) => (
                <CardListItem
                    key={card.id}
                    card={card}
                    onSelect={
                        actionContext.onView
                            ? () => actionContext.onView?.(card)
                            : undefined
                    }
                    onOpenActions={() => setActiveCard(card)}
                />
            ))}

            <CardActionsDrawer
                open={!!activeCard}
                onOpenChange={(open) => {
                    if (!open) setActiveCard(null);
                }}
                card={activeCard}
                context={actionContext}
                trigger={null}
            />
        </div>
    );
}