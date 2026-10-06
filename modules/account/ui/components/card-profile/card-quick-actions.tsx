"use client";

import * as React from "react";
import {
    CreditCard,
    MoreHorizontal,
    Receipt,
    SlidersHorizontal,
} from "lucide-react";
import { DataTableRowActions } from "@/components/actions/menu";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { CardProfile } from "@/modules/account/core/schemas/card-profile.schema";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import {
    CARD_PROFILE_ACTIONS,
    CardActionContext,
    CardActionsDrawer,
} from "../card-actions-drawer";

interface CardQuickActionsProps {
    card: CardProfile;
    cardActionsContext?: CardActionContext;
    onExpenseClick?: () => void;
    onPayInvoiceClick?: () => void;
    onAdjustLimitClick?: () => void;
    className?: string;
}

export function CardQuickActions({
    card,
    cardActionsContext,
    onExpenseClick,
    onPayInvoiceClick,
    onAdjustLimitClick,
    className,
}: CardQuickActionsProps) {
    const { isArchived } = card;
    const isDesktop = useIsDesktop();

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

    const optionsTrigger = (
        <button
            type="button"
            className="group flex flex-col items-center gap-1 cursor-pointer min-w-0"
        >
            <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-border/70 bg-muted/60 dark:bg-muted/40 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-muted group-hover:shadow-xs">
                <MoreHorizontal className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                Opções
            </span>
        </button>
    );

    return (
        <div className={cn("grid grid-cols-4 gap-2 w-full", className)}>
            {/* 1. Nova Compra (Rose) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onExpenseClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/15 dark:border-rose-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-rose-500/20 group-hover:shadow-xs">
                    <CreditCard className="size-4 text-rose-600 dark:text-rose-400 transition-transform group-hover:-translate-y-0.5" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Comprar
                </span>
            </button>

            {/* 2. Pagar Fatura (Emerald) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onPayInvoiceClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 dark:border-emerald-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-emerald-500/20 group-hover:shadow-xs">
                    <Receipt className="size-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-translate-y-0.5" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Pagar
                </span>
            </button>

            {/* 3. Ajustar Limite (Blue) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onAdjustLimitClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15 dark:border-blue-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-blue-500/20 group-hover:shadow-xs">
                    <SlidersHorizontal className="size-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Limite
                </span>
            </button>

            {/* 4. Opções */}
            {isDesktop ? (
                <DataTableRowActions
                    row={cardSummary}
                    actions={CARD_PROFILE_ACTIONS}
                    context={cardActionsContext}
                    trigger={optionsTrigger}
                />
            ) : (
                <CardActionsDrawer
                    card={cardSummary}
                    actions={CARD_PROFILE_ACTIONS}
                    context={cardActionsContext}
                    trigger={optionsTrigger}
                />
            )}
        </div>
    );
}

export default CardQuickActions;