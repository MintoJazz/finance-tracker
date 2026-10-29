"use client";

import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    CardCycleOption,
    CardCycleStatusEnum,
} from "@/modules/cards/models/card-profile.schema";

const CYCLE_STATUS_CONFIG: Record<
    string,
    { label: string; className: string }
> = {
    OPEN: {
        label: "Fatura aberta",
        className:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    CLOSED: {
        label: "Fechada",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    PENDING: {
        label: "Fechada",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    PAID: {
        label: "Paga",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    OVERDUE: {
        label: "Vencida",
        className:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    FUTURE: {
        label: "Futura",
        className:
            "border-border text-muted-foreground bg-muted/40",
    },
    PROJECTED: {
        label: "Projetada",
        className:
            "border-border text-muted-foreground bg-muted/40",
    },
    PARTIAL: {
        label: "Parcial",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
};

function formatShortPeriod(from: string, to: string): string {
    const [, fromMonth, fromDay] = from.split("-");
    const [, toMonth, toDay] = to.split("-");
    if (!fromDay || !toDay) return `${from} a ${to}`;
    return `${fromDay}/${fromMonth} a ${toDay}/${toMonth}`;
}

interface CardCycleNavigatorProps {
    activeCycle: CardCycleOption;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    className?: string;
}

export function CardCycleNavigator({
    activeCycle,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    className,
}: CardCycleNavigatorProps) {
    const statusConfig = CYCLE_STATUS_CONFIG[activeCycle.status] ?? {
        label: activeCycle.status,
        className: "border-border text-muted-foreground bg-muted/40",
    };

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xs",
                className
            )}
        >
            {/* Seta Anterior */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!hasPrev}
                onClick={onPrev}
                className="size-8 shrink-0 rounded-lg"
                aria-label="Fatura anterior"
            >
                <ChevronLeft className="size-4" />
            </Button>

            {/* Centro: Mês + Status à esquerda | Total da Fatura à direita */}
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 min-w-0 px-1">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
                            {activeCycle.label}
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
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <CalendarClock className="size-3.5 shrink-0" />
                        <span>
                            Ciclo {formatShortPeriod(activeCycle.from, activeCycle.to)}
                        </span>
                        <span>•</span>
                        <span>Vence {formatDate(activeCycle.dueDate)}</span>
                    </div>
                </div>

                <div className="flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-border/50 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                        Total da fatura
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-foreground">
                        {formatMoney(activeCycle.invoiceAmount)}
                    </span>
                </div>
            </div>

            {/* Seta Próxima */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!hasNext}
                onClick={onNext}
                className="size-8 shrink-0 rounded-lg"
                aria-label="Próxima fatura"
            >
                <ChevronRight className="size-4" />
            </Button>
        </div>
    );
}

export default CardCycleNavigator;