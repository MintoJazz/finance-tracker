"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/movements/models/wallet-movement.schema";
import { EmptyWalletMovementList } from "./empty";
import { WalletMovementListItem } from "./list-item";
import { MovementActionContext } from "../wallet-movements-actions-menu";
import { MovementList } from "../movement-list";

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
        return <MovementList.Skeleton />;
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
        <MovementList className={cn("w-full flex flex-col", className)}>
            <MovementList.Content>
                {items.map((movement) => (
                    <WalletMovementListItem
                        key={movement.movementId}
                        movement={movement}
                        onOpenActions={() => setActiveMovement(movement)}
                    />
                ))}
            </MovementList.Content>

            <MovementList.Sentinel
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                sentinelRef={sentinelRef}
                loadingMessage="Carregando mais movimentações..."
                allLoadedMessage="Todas as movimentações foram carregadas"
            />

            <MovementList.ActionsDrawer
                movement={activeMovement}
                onOpenChange={(open) => {
                    if (!open) setActiveMovement(null);
                }}
                context={actionContext}
            />
        </MovementList>
    );
}

export default WalletMovementList;