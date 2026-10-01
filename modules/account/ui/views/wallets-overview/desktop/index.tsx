"use client"

import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import WalletTable from "../../../components/wallet-table";
import { WalletOverviewProps } from "../types";

export default function WalletsOverviewViewDesktop({ data, actionsMenuContext, filterContext, onAddClick, paginationContext }: WalletOverviewProps) {
    const { searchProps, showArchived } = filterContext

    return <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
        <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight">Carteiras</h1>
                <Badge variant="outline" className="tabular-nums">
                    {data.total}
                </Badge>
            </div>
            <Button size="sm" onClick={onAddClick} >
                <Plus data-icon="inline-start" />
                Nova carteira
            </Button>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <InputGroup className="lg:max-w-xs">
                <InputGroupAddon><Search /></InputGroupAddon>
                <InputGroupInput {...searchProps}
                    placeholder="Buscar por nome"
                />
            </InputGroup>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <Toggle {...showArchived}
                    aria-label="Incluir arquivadas"
                    size="sm"
                    variant="outline"
                >
                    Incluir arquivadas
                </Toggle>
            </div>
        </div>

        <WalletTable {...paginationContext}
            data={data}
            actionContext={actionsMenuContext}
        />

        <p className="text-xs text-muted-foreground">
            Mostrando {data.data.length} de {data.total} carteiras
        </p>
    </div>
}