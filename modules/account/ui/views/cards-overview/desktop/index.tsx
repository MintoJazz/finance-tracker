"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold tracking-tight">Cartões</h1>
                    <Badge variant="outline" className="tabular-nums">
                        {data.total}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href="/cards/archived" />}
                    >
                        <Archive className="size-4" />
                    </Button>
                    <Button size="sm" onClick={onAddClick}>
                        <Plus data-icon="inline-start" />
                        Novo cartão
                    </Button>
                </div>
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
        </div>
    );
}