"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ContractCycleProfile,
    ContractCycleProfileStatus,
} from "../../../core/schemas/contract-cycle.schema";

const CYCLE_STATUS_CONFIG: Record<
    ContractCycleProfileStatus,
    { label: string; className: string }
> = {
    projected: {
        label: "Projetado",
        className: "border-border text-muted-foreground bg-muted/40",
    },
    open: {
        label: "Em aberto",
        className:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    paid: {
        label: "Pago",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    partial: {
        label: "Parcial",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    overdue: {
        label: "Vencido",
        className:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    transferred: {
        label: "Transferido",
        className:
            "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10",
    },
};

interface ContractCycleNavigatorProps {
    cycle: ContractCycleProfile;
    className?: string;
}

export function ContractCycleNavigator({
    cycle,
    className,
}: ContractCycleNavigatorProps) {
    const statusConfig = CYCLE_STATUS_CONFIG[cycle.status] ?? {
        label: cycle.status,
        className: "border-border text-muted-foreground bg-muted/40",
    };

    const prevHref = cycle.prev
        ? `/contracts/${cycle.contractId}/cycle?from=${cycle.prev.from}&to=${cycle.prev.to}`
        : null;

    const nextHref = cycle.next
        ? `/contracts/${cycle.contractId}/cycle?from=${cycle.next.from}&to=${cycle.next.to}`
        : null;

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xs",
                className
            )}
        >
            {/* Seta Anterior via Link ou botão desabilitado */}
            {prevHref ? (
                <Link
                    href={prevHref}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-8 shrink-0 rounded-lg"
                    )}
                    aria-label="Ciclo anterior"
                >
                    <ChevronLeft className="size-4" />
                </Link>
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    className="size-8 shrink-0 rounded-lg opacity-40 cursor-not-allowed"
                    aria-label="Ciclo anterior (indisponível)"
                >
                    <ChevronLeft className="size-4" />
                </Button>
            )}

            {/* Centro: Título + Status à esquerda | Total à direita */}
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 min-w-0 px-1">
                <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
                        {cycle.title}
                    </span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] px-1.5 py-0 font-medium",
                            statusConfig.className
                        )}
                    >
                        {statusConfig.label}
                    </Badge>
                </div>
            </div>

            {/* Seta Próxima via Link ou botão desabilitado */}
            {nextHref ? (
                <Link
                    href={nextHref}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-8 shrink-0 rounded-lg"
                    )}
                    aria-label="Próximo ciclo"
                >
                    <ChevronRight className="size-4" />
                </Link>
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    className="size-8 shrink-0 rounded-lg opacity-40 cursor-not-allowed"
                    aria-label="Próximo ciclo (indisponível)"
                >
                    <ChevronRight className="size-4" />
                </Button>
            )}
        </div>
    );
}

export default ContractCycleNavigator;
