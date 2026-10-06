"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Loader2, Plus, Search } from "lucide-react";
import WalletList from "../../../components/wallet-list";
import { MobileWalletOverviewProps } from "../types";
import { IncludeArchivedToggle } from "@/components/include-archived-toggle";
import { ArchiveWalletModalViewMobile } from "../../archive-wallet-modal";
import { RestoreWalletModalViewMobile } from "../../restore-wallet-modal";

export default function WalletsOverviewViewMobile({
    items,
    total,
    hasMore,
    isLoadingMore,
    sentinelRef,
    actionsMenuContext,
    filterContext,
    onAddClick,
    archiveContext,
    restoreContext,
}: MobileWalletOverviewProps) {
    const { searchProps, showArchived } = filterContext;

    return (
        <div className="flex w-full flex-col gap-4 py-4 pb-12">
            <header className="flex items-center justify-between gap-2 px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold tracking-tight">Carteiras</h1>
                    <Badge variant="outline" className="tabular-nums">
                        {total}
                    </Badge>
                </div>
                <Button size="sm" onClick={onAddClick} className="gap-1.5">
                    <Plus className="size-4" />
                    Nova
                </Button>
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
                <div className="flex items-center justify-between">
                    <IncludeArchivedToggle
                        {...showArchived}
                        label="Incluir arquivadas"
                        className="text-xs"
                        iconClassName="size-3.5"
                    />
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {items.length} de {total}
                    </span>
                </div>
            </div>

            <WalletList
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
                            <span>Carregando mais carteiras...</span>
                        </div>
                    )}
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2 px-4">
                    Todas as carteiras foram carregadas
                </p>
            )}

            <ArchiveWalletModalViewMobile {...archiveContext} />
            <RestoreWalletModalViewMobile {...restoreContext} />
        </div>
    );
}