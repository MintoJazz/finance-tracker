"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContractCycleItem } from "../../../../core/schemas/contract-cycle.schema";
import { ContractCycleListItem } from "./item";
import { EmptyContractCycleList } from "./empty";
import { ContractCycleListSkeleton } from "../skeletons/contract-cycle-list-skeleton";
import {
    ContractCycleActionsDrawer,
    ContractCycleActionContext,
} from "../contract-cycle-actions";

interface ContractCycleListProps {
    items: ContractCycleItem[];
    isPayable: boolean;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    sentinelRef?: (node: HTMLDivElement | null) => void;
    cycleActionContext?: ContractCycleActionContext;
    className?: string;
}

export function ContractCycleList({
    items,
    isPayable,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    hasFilters = false,
    onClearFilters,
    sentinelRef,
    cycleActionContext,
    className,
}: ContractCycleListProps) {
    const [selectedCycleForActions, setSelectedCycleForActions] =
        React.useState<ContractCycleItem | null>(null);
    const [isActionsDrawerOpen, setIsActionsDrawerOpen] = React.useState(false);
    if (isLoading && items.length === 0) {
        return <ContractCycleListSkeleton />;
    }

    if (items.length === 0) {
        return (
            <EmptyContractCycleList
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
                className={className}
            />
        );
    }

    return (
        <div className={cn("w-full flex flex-col", className)}>
            <div className="w-full flex flex-col divide-y divide-border border-y border-border">
                {items.map((cycle) => (
                    <ContractCycleListItem
                        key={cycle.cycleKey}
                        cycle={cycle}
                        isPayable={isPayable}
                        onOpenActions={
                            cycleActionContext
                                ? () => {
                                      setSelectedCycleForActions(cycle);
                                      setIsActionsDrawerOpen(true);
                                  }
                                : undefined
                        }
                    />
                ))}
            </div>

            {/* Sentinela de interseção para paginação/scroll infinito */}
            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="flex w-full items-center justify-center py-4 px-4"
                >
                    {isLoadingMore && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Carregando mais ciclos...</span>
                        </div>
                    )}
                </div>
            )}
            {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-3 px-4">
                    Todos os ciclos foram carregados
                </p>
            )}

            {/* Gaveta de Ações do Ciclo Selecionado */}
            <ContractCycleActionsDrawer
                cycle={selectedCycleForActions}
                isPayable={isPayable}
                context={cycleActionContext}
                open={isActionsDrawerOpen}
                onOpenChange={setIsActionsDrawerOpen}
            />
        </div>
    );
}

export default ContractCycleList;
