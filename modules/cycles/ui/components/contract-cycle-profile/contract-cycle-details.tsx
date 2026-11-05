"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { QuickActions } from "@/components/quick-actions";
import { toast } from "@/components/ui/toast";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ContractCycleProfile } from "@/modules/cycles/models/contract-cycle.schema";
import { ContractCycleProgress } from "./contract-cycle-progress";
import {
    CONTRACT_CYCLE_ACTIONS,
    ContractCycleActionContext,
    ContractCycleActionsDrawerHeader,
    cycleProfileToItem,
} from "./contract-cycle-actions";

export interface ContractCycleDetailsProps {
    cycle: ContractCycleProfile;
    cycleActionContext?: ContractCycleActionContext;
    onSkip?: (cycle: ContractCycleProfile) => void;
    className?: string;
    children?: React.ReactNode;
}

export function ContractCycleDetails({
    cycle,
    cycleActionContext,
    onSkip,
    className,
    children,
}: ContractCycleDetailsProps) {
    const cycleItem = React.useMemo(
        () => cycleProfileToItem(cycle),
        [cycle]
    );

    const defaultActionContext = React.useMemo<ContractCycleActionContext>(
        () => ({
            onConsolidate: (c) => {
                toast.add({
                    type: "info",
                    title: "Consolidar ciclo",
                    description: `Consolidação do ciclo ${c.label} em desenvolvimento.`,
                });
            },
            onSettle: (c) => {
                toast.add({
                    type: "info",
                    title: "Liquidar ciclo",
                    description: `Liquidação do ciclo ${c.label} em desenvolvimento.`,
                });
            },
            onAdjustValue: (c) => {
                toast.add({
                    type: "info",
                    title: "Ajustar valor",
                    description: `Ajuste de valor do ciclo ${c.label} em desenvolvimento.`,
                });
            },
            onDiscard: (c) => {
                if (onSkip) {
                    onSkip(cycle);
                } else {
                    toast.add({
                        type: "info",
                        title: "Descartar ciclo",
                        description: `Descarte do ciclo ${c.label} em desenvolvimento.`,
                    });
                }
            },
        }),
        [cycle, onSkip]
    );

    const effectiveContext = cycleActionContext ?? defaultActionContext;
    const isProjected = cycle.status === "PROJECTED";

    return (
        <div
            className={cn(
                "w-full max-w-md mx-auto flex flex-col items-center text-center gap-4.5 sm:gap-5",
                className
            )}
        >
            {/* 1. Nome do contrato como link */}
            <Link
                href={`/contracts/${cycle.contractId}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                title={`Ver contrato ${cycle.contractName}`}
            >
                <span className="truncate max-w-[280px] sm:max-w-md">
                    {cycle.contractName}
                </span>
                <ChevronRight className="size-3.5 sm:size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* 2 & 3. Rótulo de status e valor grande */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isProjected
                        ? "Estimativa do Ciclo"
                        : cycle.openAmount > 0
                            ? "Saldo a Liquidar"
                            : "Ciclo Quitado"}
                </span>
                <div className="flex items-baseline justify-center gap-2 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-foreground tabular-nums">
                        {formatMoney(
                            isProjected || cycle.openAmount === 0
                                ? cycle.expectedAmount
                                : cycle.openAmount
                        )}
                    </span>
                    {cycle.openAmount > 0 && cycle.paidAmount > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground font-mono tabular-nums">
                            de {formatMoney(cycle.expectedAmount)}
                        </span>
                    )}
                </div>
            </div>

            {/* 4. Linha de apoio: Vencimento e Competência */}
            <div className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground">
                <p className="text-center">
                    Vence {formatDate(cycle.dueDate)} • Competência{" "}
                    {cycle.range.from === cycle.range.to
                        ? formatDate(cycle.range.from)
                        : `${formatDate(cycle.range.from)} a ${formatDate(cycle.range.to)}`}
                </p>
                {isProjected && (
                    <span className="italic">
                        Sem movimentações consolidadas
                    </span>
                )}
            </div>

            {/* 5. Barra de progresso e legenda (Pago / Em aberto) */}
            {!isProjected && (
                <div className="w-full max-w-sm sm:max-w-md">
                    <ContractCycleProgress cycle={cycle} />
                </div>
            )}

            {/* Quick actions juntas no mesmo row */}
            <div className="w-full max-w-sm sm:max-w-md flex justify-center pt-1">
                <QuickActions
                    row={cycleItem}
                    actions={CONTRACT_CYCLE_ACTIONS}
                    context={effectiveContext}
                    optionsHeader={
                        <ContractCycleActionsDrawerHeader
                            cycle={cycleItem}
                            isPayable={true}
                        />
                    }
                />
            </div>

            {children}
        </div>
    );
}

export default ContractCycleDetails;

