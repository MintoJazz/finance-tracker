"use client";

import { useMemo } from "react";
import { useGlobalActions } from "@/components/global-actions";
import { Archive, Plus, Search } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import WalletTable from "../../../components/wallet-table";
import { WalletOverviewProps } from "../types";
import { ArchiveWalletModalViewDesktop } from "../../archive-wallet-modal";

export default function WalletsOverviewViewDesktop({
    data,
    actionsMenuContext,
    filterContext,
    onAddClick,
    paginationContext,
    archiveContext,
}: WalletOverviewProps) {
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <InputGroup className="">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        {...searchProps}
                        placeholder="Buscar por nome"
                    />
                </InputGroup>
            </header>

            <WalletTable
                {...paginationContext}
                data={data}
                actionContext={actionsMenuContext}
            />

            <p className="text-xs text-muted-foreground">
                Mostrando {data.data.length} de {data.total} carteiras
            </p>

            <ArchiveWalletModalViewDesktop {...archiveContext} />
        </div>
    );
}