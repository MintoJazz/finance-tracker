"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CalendarClock } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/formatters";
import { Card } from "@/components/ui/card";
import { QuickActions } from "@/components/quick-actions";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { ContractCycleProfile } from "@/modules/cycles/models/contract-cycle.schema";
import { ContractCycleProgress } from "./contract-cycle-progress";
import {
    CONTRACT_CYCLE_ACTIONS,
    ContractCycleActionContext,
    ContractCycleActionsDrawerHeader,
    cycleProfileToItem,
} from "./contract-cycle-actions";

interface ContractCycleSummaryProps {
    cycle: ContractCycleProfile;
    cycleActionContext?: ContractCycleActionContext;
    onSkip?: (cycle: ContractCycleProfile) => void;
    className?: string;
    children?: React.ReactNode;
}

export function ContractCycleSummary({
    cycle,
    cycleActionContext,
    onSkip,
    className,
    children,
}: ContractCycleSummaryProps) {
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
        <Card
            className={cn(
                "p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 bg-card shadow-2xs w-full",
                className
            )}
        >
            {/* 1. Cabeçalho: Nome do contrato à esquerda, link 'Ver contrato' à direita; Metadados abaixo */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                        {cycle.contractName}
                    </h1>
                    <Link
                        href={`/contracts/${cycle.contractId}`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
                        title={`Ver contrato ${cycle.contractName}`}
                    >
                        <span>Ver contrato</span>
                        <ArrowRight className="size-3" />
                    </Link>
                </div>

                {/* Linha de meta: Vencimento e Competência */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1 font-medium text-foreground">
                        <CalendarClock className="size-3.5 text-muted-foreground" />
                        <span>Vence {formatDate(new Date(cycle.dueDate))}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span>
                            Competência: {formatDate(new Date(cycle.range.from))} a{" "}
                            {formatDate(new Date(cycle.range.to))}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Linha do valor (desktop): Rótulo e valor à esquerda, Quick Actions alinhadas à direita da mesma linha */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:min-h-14.5">
                {/* Rótulo e valor */}
                <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {isProjected
                            ? "Estimativa do Ciclo"
                            : cycle.openAmount > 0
                                ? "Saldo a Liquidar"
                                : "Ciclo Quitado"}
                    </span>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground tabular-nums">
                            {formatMoney(
                                isProjected || cycle.openAmount === 0
                                    ? cycle.expectedAmount
                                    : cycle.openAmount
                            )}
                        </span>
                        {cycle.openAmount > 0 && cycle.paidAmount > 0 && (
                            <span className="text-xs text-muted-foreground font-mono tabular-nums">
                                de {formatMoney(cycle.expectedAmount)}
                            </span>
                        )}
                    </div>
                    {isProjected && (
                        <span className="text-xs text-muted-foreground italic mt-0.5">
                            Sem movimentações consolidadas
                        </span>
                    )}
                </div>

                {/* Quick actions */}
                <div className="w-full sm:w-[400px] shrink-0 flex justify-end">
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
            </div>

            {/* 3. Barra de progresso e legenda (Pago / Em aberto) abaixo, em largura total */}
            {!isProjected && <ContractCycleProgress cycle={cycle} />}

            {children}
        </Card>
    );
}

export default ContractCycleSummary;

