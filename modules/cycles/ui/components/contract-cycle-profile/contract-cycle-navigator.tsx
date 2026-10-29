"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ContractCycleProfile,
    ContractCycleStatusEnum,
} from "@/modules/cycles/models/contract-cycle.schema";

export const CYCLE_STATUS_CONFIG: Record<
    ContractCycleStatusEnum,
    { label: string; className: string }
> = {
    PROJECTED: {
        label: "Projetado",
        className: "border-border text-muted-foreground bg-muted/40",
    },
    OPEN: {
        label: "Em aberto",
        className:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    PENDING: {
        label: "Pendente",
        className:
            "border-sky-500/30 text-sky-700 dark:text-sky-400 bg-sky-500/10",
    },
    PAID: {
        label: "Pago",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    PARTIAL: {
        label: "Parcial",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    OVERDUE: {
        label: "Vencido",
        className:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    TRANSFERRED: {
        label: "Transferido",
        className:
            "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10",
    },
};

export interface ContractCycleNavigatorProps {
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
        <div className={cn("flex items-center justify-between gap-2 w-full", className)}>
            {/* Seta Anterior via Link ou botão desabilitado */}
            {prevHref ? (
                <Link
                    href={prevHref}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
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
                    size="icon-sm"
                    disabled
                    className="size-8 shrink-0 rounded-lg opacity-40 cursor-not-allowed"
                    aria-label="Ciclo anterior (indisponível)"
                >
                    <ChevronLeft className="size-4" />
                </Button>
            )}

            {/* Centro: Título do ciclo + Badge de status */}
            <div className="flex items-center justify-center gap-2 min-w-0 px-1">
                <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
                    {cycle.title}
                </span>
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[10px] px-1.5 py-0 font-medium shrink-0",
                        statusConfig.className
                    )}
                >
                    {statusConfig.label}
                </Badge>
            </div>

            {/* Seta Próxima via Link ou botão desabilitado */}
            {nextHref ? (
                <Link
                    href={nextHref}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
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
                    size="icon-sm"
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

