"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { EmptyCreditMovementList } from "./empty";
import { CreditMovementListItem } from "./list-item";
import { MovementActionContext } from "../wallet-movements-actions-menu";
import { MovementList } from "../movement-list";

interface CreditMovementListProps {
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

export function CreditMovementList({
    items,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    hasFilters = false,
    onClearFilters,
    sentinelRef,
    actionContext,
    className,
}: CreditMovementListProps) {
    const [activeMovement, setActiveMovement] = useState<WalletMovement | null>(null);

    if (isLoading && items.length === 0) {
        return <MovementList.Skeleton />;
    }

    if (items.length === 0) {
        return (
            <EmptyCreditMovementList
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
                    <CreditMovementListItem
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
                loadingMessage="Carregando mais compras..."
                allLoadedMessage="Todos os lançamentos da fatura foram carregados"
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

export default CreditMovementList;
