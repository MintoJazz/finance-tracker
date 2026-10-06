// modules/planning/ui/components/commitment-cycle-list/index.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommitmentCycleItem } from "../../../core/schemas/commitment-cycle.schema";
import {
    CommitmentCycleActionContext,
    CommitmentCycleActionsDrawer,
} from "../commitment-cycle-actions-drawer";
import { CycleListSkeleton } from "../skeletons/cycle-list-skeleton";
import EmptyCommitmentCycleList from "./empty";
import CommitmentCycleListItem from "./list-item";

interface Props {
    items: CommitmentCycleItem[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    sentinelRef: (node: HTMLDivElement | null) => void;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    actionContext: CommitmentCycleActionContext;
    className?: string;
}

export function CommitmentCycleList({
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    sentinelRef,
    hasFilters,
    onClearFilters,
    actionContext,
    className,
}: Props) {
    const [activeItem, setActiveItem] = useState<CommitmentCycleItem | null>(
        null
    );

    if (isLoading) {
        return <CycleListSkeleton />;
    }

    if (items.length === 0) {
        return (
            <EmptyCommitmentCycleList
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />
        );
    }

    return (
        <div className={cn("w-full flex flex-col", className)}>
            <div className="w-full flex flex-col divide-y divide-border border-y border-border">
                {items.map((item) => {
                    const uniqueKey = `${item.balanceType}-${item.balanceId}-${item.from}-${item.to}`;
                    return (
                        <CommitmentCycleListItem
                            key={uniqueKey}
                            item={item}
                            onSelect={
                                actionContext.onViewDetails
                                    ? () => actionContext.onViewDetails?.(item)
                                    : undefined
                            }
                            onOpenActions={() => setActiveItem(item)}
                        />
                    );
                })}
            </div>

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2"
                >
                    {isLoadingMore && (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Carregando mais compromissos...</span>
                        </>
                    )}
                </div>
            )}

            <CommitmentCycleActionsDrawer
                open={!!activeItem}
                onOpenChange={(open) => {
                    if (!open) setActiveItem(null);
                }}
                item={activeItem}
                context={actionContext}
                trigger={null}
            />
        </div>
    );
}

export default CommitmentCycleList;