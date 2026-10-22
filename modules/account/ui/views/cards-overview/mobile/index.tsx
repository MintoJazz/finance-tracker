"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

    return (
        <div className="flex w-full flex-col gap-4 py-4 pb-12">
            <header className="flex items-center justify-between gap-2 px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold tracking-tight">Cartões</h1>
                    <Badge variant="outline" className="tabular-nums">
                        {total}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        render={<Link href="/cards/archived" />}
                        className="gap-1.5 px-2.5"
                    >
                        <Archive className="size-4" />
                        <span className="sr-only sm:not-sr-only">Arquivados</span>
                    </Button>
                    <Button size="sm" onClick={onAddClick} className="gap-1.5">
                        <Plus className="size-4" />
                        Novo
                    </Button>
                </div>
            </header>

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
                <div className="flex items-center justify-end">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {items.length} de {total}
                    </span>
                </div>
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