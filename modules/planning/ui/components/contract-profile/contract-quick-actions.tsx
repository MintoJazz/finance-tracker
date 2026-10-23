"use client";

import * as React from "react";
import {
    MoreHorizontal,
    PauseCircle,
    Pencil,
    PlayCircle,
} from "lucide-react";
import { DataTableRowActions } from "@/components/actions/menu";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { ContractProfile } from "../../../core/schemas/contract-profile.schema";
import { ContractSummaryItem } from "../../../core/schemas/contract.schema";
import {
    CONTRACT_ACTIONS,
    ContractActionContext,
    ContractActionsDrawer,
} from "../contract-actions-drawer";

interface ContractQuickActionsProps {
    contract: ContractProfile;
    contractActionsContext?: ContractActionContext;
    onToggleProjection?: () => void;
    onEditClick?: () => void;
    className?: string;
}

export function ContractQuickActions({
    contract,
    contractActionsContext,
    onToggleProjection,
    onEditClick,
    className,
}: ContractQuickActionsProps) {
    const { isArchived, includeInProjection } = contract;
    const isDesktop = useIsDesktop();

    const contractSummary = React.useMemo<ContractSummaryItem>(
        () => ({
            id: contract.id,
            balanceId: contract.balanceId,
            name: contract.name,
            type: contract.type,
            value: contract.value,
            frequency: contract.frequency,
            dueDay: contract.dueDay,
            dueMonth: contract.dueMonth,
            startsAt: contract.startsAt,
            endsAt: contract.endsAt,
            includeInProjection: contract.includeInProjection,
            isArchived: contract.isArchived,
        }),
        [contract]
    );

    const optionsTrigger = (
        <button
            type="button"
            className="group flex flex-col items-center gap-1 cursor-pointer min-w-0"
        >
            <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-border/70 bg-muted/60 dark:bg-muted/40 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-muted group-hover:shadow-xs">
                <MoreHorizontal className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                Opções
            </span>
        </button>
    );

    return (
        <div className={cn("grid grid-cols-3 gap-2 w-full", className)}>
            {/* 1. Alternar Projeção (Play/Pause) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onToggleProjection}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div
                    className={cn(
                        "w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-xs",
                        includeInProjection
                            ? "border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/15 dark:border-amber-500/30 group-hover:bg-amber-500/20"
                            : "border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 dark:border-emerald-500/30 group-hover:bg-emerald-500/20"
                    )}
                >
                    {includeInProjection ? (
                        <PauseCircle className="size-4 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110" />
                    ) : (
                        <PlayCircle className="size-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
                    )}
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    {includeInProjection ? "Pausar" : "Ativar"}
                </span>
            </button>

            {/* 2. Editar Contrato (Blue) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onEditClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15 dark:border-blue-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-blue-500/20 group-hover:shadow-xs">
                    <Pencil className="size-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:-translate-y-0.5" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Editar
                </span>
            </button>

            {/* 3. Opções Extras (Drawer/Menu com Arquivar/Restaurar) */}
            {isDesktop ? (
                <DataTableRowActions
                    row={contractSummary}
                    actions={CONTRACT_ACTIONS}
                    context={contractActionsContext}
                    trigger={optionsTrigger}
                />
            ) : (
                <ContractActionsDrawer
                    contract={contractSummary}
                    actions={CONTRACT_ACTIONS}
                    context={contractActionsContext}
                    trigger={optionsTrigger}
                />
            )}
        </div>
    );
}

export default ContractQuickActions;
