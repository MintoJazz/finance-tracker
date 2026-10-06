"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { EmptyWalletMovementList } from "./empty";
import { WalletMovementListItem } from "./list-item";
import { MovementListSkeleton } from "../skeletons/movement-list-skeleton";
import WalletMovementActionsDrawer, { MovementActionContext } from "../wallet-movements-actions-menu";

interface WalletMovementListProps {
    items: WalletMovement[];
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    sentinelRef?: (node: HTMLDivElement | null) => void;
    actionContext?: MovementActionContext;
    className?: string;
}

export function WalletMovementList({
    items,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    hasFilters = false,
    onClearFilters,
    sentinelRef,
    actionContext,
    className,
}: WalletMovementListProps) {
    const [activeMovement, setActiveMovement] = useState<WalletMovement | null>(null);

    if (isLoading && items.length === 0) {
        return <MovementListSkeleton />;
    }

    if (items.length === 0) {
        return (
            <EmptyWalletMovementList
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
                className={className}
            />
        );
    }

    return (
        <div className={cn("w-full flex flex-col", className)}>
            <div className="w-full flex flex-col divide-y divide-border border-y border-border">
                {items.map((movement) => (
                    <WalletMovementListItem
                        key={movement.movementId}
                        movement={movement}
                        onOpenActions={() => setActiveMovement(movement)}
                    />
                ))}
            </div>

            <WalletMovementActionsDrawer
                open={!!activeMovement}
                onOpenChange={(open) => {
                    if (!open) setActiveMovement(null);
                }}
                movement={activeMovement}
                context={actionContext}
                trigger={null}
            />

            {/* Sentinela de interseção para carregamento infinito */}
            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="flex w-full items-center justify-center py-4 px-4"
                >
                    {isLoadingMore && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Carregando mais movimentações...</span>
                        </div>
                    )}
                </div>
            )}
            {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-3 px-4">
                    Todas as movimentações foram carregadas
                </p>
            )}
        </div>
    );
}

export default WalletMovementList;