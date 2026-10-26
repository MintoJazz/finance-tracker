"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementListSkeleton } from "../skeletons/movement-list-skeleton";
import WalletMovementActionsDrawer, {
    MovementActionContext,
} from "../wallet-movements-actions-menu";

interface MovementListRootProps {
    children: React.ReactNode;
    className?: string;
}

export function MovementListRoot({ children, className }: MovementListRootProps) {
    return <div className={cn("w-full flex flex-col", className)}>{children}</div>;
}

interface MovementListContentProps {
    children: React.ReactNode;
    className?: string;
}

export function MovementListContent({
    children,
    className,
}: MovementListContentProps) {
    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border border-y border-border",
                className
            )}
        >
            {children}
        </div>
    );
}

interface MovementListSentinelProps {
    hasMore?: boolean;
    isLoadingMore?: boolean;
    sentinelRef?: (node: HTMLDivElement | null) => void;
    loadingMessage?: string;
    allLoadedMessage?: string;
}

export function MovementListSentinel({
    hasMore = false,
    isLoadingMore = false,
    sentinelRef,
    loadingMessage = "Carregando mais...",
    allLoadedMessage = "Todos os lançamentos foram carregados",
}: MovementListSentinelProps) {
    if (hasMore) {
        return (
            <div
                ref={sentinelRef}
                className="flex w-full items-center justify-center py-4 px-4"
            >
                {isLoadingMore && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>{loadingMessage}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <p className="text-center text-xs text-muted-foreground py-3 px-4">
            {allLoadedMessage}
        </p>
    );
}

interface MovementListActionsDrawerProps {
    movement: WalletMovement | null;
    onOpenChange: (open: boolean) => void;
    context?: MovementActionContext;
}

export function MovementListActionsDrawer({
    movement,
    onOpenChange,
    context,
}: MovementListActionsDrawerProps) {
    return (
        <WalletMovementActionsDrawer
            open={!!movement}
            onOpenChange={onOpenChange}
            movement={movement}
            context={context}
            trigger={null}
        />
    );
}

export const MovementList = Object.assign(MovementListRoot, {
    Content: MovementListContent,
    Sentinel: MovementListSentinel,
    ActionsDrawer: MovementListActionsDrawer,
    Skeleton: MovementListSkeleton,
});
