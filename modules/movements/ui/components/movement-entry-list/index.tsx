"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { MovementEntryListItem } from "./item";
import { MovementList } from "../movement-list";
import { MovementListSkeleton } from "../skeletons/movement-list-skeleton";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

export interface MovementEntryListProps {
    entries: MovementEntry[];
    scope: MovementEntryScope;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    sentinelRef?: (node: HTMLDivElement | null) => void;
    onSelectEntry?: (entry: MovementEntry) => void;
    className?: string;
    emptyTitle?: string;
    emptyDescription?: string;
}

export function MovementEntryList({
    entries,
    scope,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    hasFilters = false,
    onClearFilters,
    sentinelRef,
    onSelectEntry,
    className,
    emptyTitle = "Nenhum lançamento encontrado",
    emptyDescription,
}: MovementEntryListProps) {
    if (isLoading && entries.length === 0) {
        return <MovementListSkeleton />;
    }

    if (entries.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/70 bg-card/40 my-2",
                    className
                )}
            >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                    <Inbox className="size-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                    {emptyTitle}
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mb-4">
                    {emptyDescription ||
                        (hasFilters
                            ? "Nenhum lançamento corresponde aos filtros ativos."
                            : "Não há movimentações registradas neste período.")}
                </p>
                {hasFilters && onClearFilters && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs"
                    >
                        Limpar filtros
                    </Button>
                )}
            </div>
        );
    }

    return (
        <MovementList className={cn("w-full flex flex-col", className)}>
            <MovementList.Content>
                {entries.map((entry) => (
                    <MovementEntryListItem
                        key={entry.id}
                        entry={entry}
                        scope={scope}
                        onOpenActions={
                            onSelectEntry ? () => onSelectEntry(entry) : undefined
                        }
                    />
                ))}
            </MovementList.Content>

            <MovementList.Sentinel
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                sentinelRef={sentinelRef}
                loadingMessage="Carregando mais lançamentos..."
                allLoadedMessage="Todos os lançamentos foram carregados"
            />
        </MovementList>
    );
}

export default MovementEntryList;

