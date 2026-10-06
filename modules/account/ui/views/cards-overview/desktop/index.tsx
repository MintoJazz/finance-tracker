"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import CardTable from "../../../components/card-table";
import { CardOverviewProps } from "../types";
import { IncludeArchivedToggle } from "@/components/include-archived-toggle";
import { ArchiveCardModalViewDesktop } from "../../archive-card-modal";
import { RestoreCardModalViewDesktop } from "../../restore-card-modal";

export default function CardsOverviewViewDesktop({
    data,
    actionsMenuContext,
    filterContext,
    onAddClick,
    paginationContext,
    archiveContext,
    restoreContext,
}: CardOverviewProps) {
    const { searchProps, showArchived } = filterContext;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold tracking-tight">Cartões</h1>
                    <Badge variant="outline" className="tabular-nums">
                        {data.total}
                    </Badge>
                </div>
                <Button size="sm" onClick={onAddClick}>
                    <Plus data-icon="inline-start" />
                    Novo cartão
                </Button>
            </header>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <InputGroup className="lg:max-w-xs">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        {...searchProps}
                        placeholder="Buscar por nome"
                    />
                </InputGroup>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <IncludeArchivedToggle {...showArchived} />
                </div>
            </div>

            <CardTable
                {...paginationContext}
                data={data}
                actionContext={actionsMenuContext}
            />

            <p className="text-xs text-muted-foreground">
                Mostrando {data.data.length} de {data.total} cartões
            </p>

            <ArchiveCardModalViewDesktop {...archiveContext} />
            <RestoreCardModalViewDesktop {...restoreContext} />
        </div>
    );
}