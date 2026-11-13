"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/formatters";
import { CycleSummaryProps } from "./types";

export function CycleSummaryMobile({
    labels,
    total,
    paid,
    open,
    period,
    dueDate,
    isLoading = false,
    className,
}: CycleSummaryProps) {
    const progressPercent =
        total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 0;

    return (
        <section
            aria-label="Resumo do ciclo"
            className={cn(
                "-mx-4 w-[calc(100%+2rem)] px-4 pt-4 pb-3.5 flex flex-col",
                className
            )}
        >
            {/* 1. Rótulo do Total e Valor */}
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                    {labels.total}
                </span>
                {isLoading ? (
                    <div className="h-8 w-56 rounded bg-muted/60 animate-pulse mt-1" />
                ) : (
                    <span className="text-[26px] font-medium font-mono tabular-nums text-foreground [overflow-wrap:anywhere] leading-tight">
                        {formatMoney(total)}
                    </span>
                )}
            </div>

            {/* 2. Barra de Progresso */}
            <div className="h-1.5 w-full rounded-full bg-muted my-3 overflow-hidden">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* 3. Grid Pago & Em Aberto: Rótulo ACIMA do valor para evitar overflow */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                        {labels.paid}
                    </span>
                    {isLoading ? (
                        <div className="h-5 w-28 rounded bg-muted/60 animate-pulse mt-0.5" />
                    ) : (
                        <span className="text-sm font-medium font-mono tabular-nums text-foreground [overflow-wrap:anywhere]">
                            {formatMoney(paid)}
                        </span>
                    )}
                </div>

                <div className="flex flex-col text-right">
                    <span className="text-xs text-muted-foreground">
                        {labels.open}
                    </span>
                    {isLoading ? (
                        <div className="h-5 w-28 rounded bg-muted/60 animate-pulse mt-0.5 ml-auto" />
                    ) : (
                        <span className="text-sm font-medium font-mono tabular-nums text-foreground [overflow-wrap:anywhere]">
                            {formatMoney(open)}
                        </span>
                    )}
                </div>
            </div>

            {/* 4. Divisor Sutil */}
            <div className="border-t border-border/40 mt-3 pt-2.5 flex flex-col gap-1.5" />

            {/* 5. Duas Linhas: Ciclo e Vencimento */}
            <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground shrink-0">
                        {labels.period}
                    </span>
                    {isLoading ? (
                        <div className="h-4 w-36 rounded bg-muted/60 animate-pulse" />
                    ) : (
                        <span className="text-xs text-foreground text-right [overflow-wrap:anywhere]">
                            {period}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground shrink-0">
                        {labels.dueDate}
                    </span>
                    {isLoading ? (
                        <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                    ) : (
                        <span className="text-xs text-foreground text-right [overflow-wrap:anywhere]">
                            {dueDate}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}

