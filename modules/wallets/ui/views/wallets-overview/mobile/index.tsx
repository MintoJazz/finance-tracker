"use client";

import { useMemo } from "react";
import { useGlobalActions } from "@/components/global-actions";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Archive, Loader2, Plus, Search } from "lucide-react";
import WalletList from "../../../components/wallet-list";
import { MobileWalletOverviewProps } from "../types";
import { ArchiveWalletModalViewMobile } from "../../archive-wallet-modal";

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
}: MobileWalletOverviewProps) {
    const { searchProps } = filterContext;

    const globalActions = useMemo(
        () => [
            {
                id: "wallets-new",
                label: "Nova carteira",
                icon: Plus,
                onClick: onAddClick,
            },
            {
                id: "wallets-archived",
                label: "Carteiras arquivadas",
                icon: Archive,
                href: "/wallets/archived",
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
                <div className="text-sm text-muted-foreground tabular-nums">
                    {items.length} de {total}
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
        </div>
    );
}