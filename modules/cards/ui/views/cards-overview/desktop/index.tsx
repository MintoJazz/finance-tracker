"use client";

import { useMemo } from "react";
import { useGlobalActions } from "@/components/global-actions";
import { Archive, Plus, Search } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import CardTable from "../../../components/card-table";
import { CardOverviewProps } from "../types";
import { ArchiveCardModalViewDesktop } from "../../archive-card-modal";

export default function CardsOverviewViewDesktop({
    data,
    actionsMenuContext,
    filterContext,
    onAddClick,
    paginationContext,
    archiveContext,
}: CardOverviewProps) {
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        {...searchProps}
                        placeholder="Buscar por nome"
                    />
                </InputGroup>
            </header>

            <CardTable
                {...paginationContext}
                data={data}
                actionContext={actionsMenuContext}
            />

            <p className="text-xs text-muted-foreground">
                Mostrando {data.data.length} de {data.total} cartões
            </p>

            <ArchiveCardModalViewDesktop {...archiveContext} />
        </div>
    );
}