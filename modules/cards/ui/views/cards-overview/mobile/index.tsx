"use client";

import { useMemo } from "react";
import { useGlobalActions } from "@/components/global-actions";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Archive, Loader2, Plus, Search } from "lucide-react";
import CardList from "../../../components/card-list";
import { MobileCardOverviewProps } from "../types";
import { ArchiveCardModalViewMobile } from "../../archive-card-modal";

export default function CardsOverviewViewMobile({
    items,
    total,
    hasMore,
    isLoadingMore,
    sentinelRef,
    actionsMenuContext,
    filterContext,
    onAddClick,
    archiveContext,
}: MobileCardOverviewProps) {
    const { searchProps } = filterContext;

    const globalActions = useMemo(
        () => [
            {
                id: "cards-new",
                label: "Novo cartão",
                icon: Plus,
                onClick: onAddClick,
            },
            {
                id: "cards-archived",
                label: "Cartões arquivados",
                icon: Archive,
                href: "/cards/archived",
            },
        ],
        [onAddClick]
    );
    useGlobalActions(globalActions);

    return (
        <div className="flex w-full flex-col gap-3 py-4 pb-12">
            <div className="flex flex-col gap-2.5 px-4">
                <InputGroup className="w-full">
                    <InputGroupAddon>
                        <Search className="size-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                        {...searchProps}
                        placeholder="Buscar por nome"
                    />
                </InputGroup>
            </div>

            <div className="flex items-center justify-between gap-2 px-4">
                <span className="text-xs text-muted-foreground tabular-nums">
                    {items.length} de {total}
                </span>
            </div>

            <CardList
                data={items}
                actionContext={actionsMenuContext}
            />

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="flex w-full items-center justify-center py-4 px-4"
                >
                    {isLoadingMore && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Carregando mais cartões...</span>
                        </div>
                    )}
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2 px-4">
                    Todos os cartões foram carregados
                </p>
            )}

            <ArchiveCardModalViewMobile {...archiveContext} />
        </div>
    );
}