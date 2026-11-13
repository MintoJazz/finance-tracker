"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/formatters";
import { CycleSummaryProps } from "./types";

export function CycleSummaryDesktop({
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
            className={cn("w-full pt-5 pb-4 flex flex-col", className)}
        >
            {/* 1. Linha Principal: Total à esquerda e Metadados (Ciclo & Vencimento) à direita */}
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                {/* Esquerda: Rótulo e Valor Total */}
                <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">
                        {labels.total}
                    </span>
                    {isLoading ? (
                        <div className="h-9 w-64 rounded bg-muted/60 animate-pulse mt-1" />
                    ) : (
                        <span className="text-3xl font-medium font-mono tabular-nums text-foreground [overflow-wrap:anywhere]">
                            {formatMoney(total)}
                        </span>
                    )}
                </div>

                {/* Direita: Período e Vencimento */}
                <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                            {labels.period}
                        </span>
                        {isLoading ? (
                            <div className="h-5 w-36 rounded bg-muted/60 animate-pulse mt-0.5" />
                        ) : (
                            <span className="text-sm text-foreground">
                                {period}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                            {labels.dueDate}
                        </span>
                        {isLoading ? (
                            <div className="h-5 w-24 rounded bg-muted/60 animate-pulse mt-0.5" />
                        ) : (
                            <span className="text-sm text-foreground">
                                {dueDate}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Barra de Progresso */}
            <div className="h-1.5 w-full rounded-full bg-muted mt-3.5 mb-2 overflow-hidden">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* 3. Rodapé: Pago à esquerda e Em Aberto à direita */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-muted-foreground">
                        {labels.paid}
                    </span>
                    {isLoading ? (
                        <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                    ) : (
                        <span className="font-mono tabular-nums text-foreground font-medium">
                            {formatMoney(paid)}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-muted-foreground">
                        {labels.open}
                    </span>
                    {isLoading ? (
                        <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                    ) : (
                        <span className="font-mono tabular-nums text-foreground font-medium">
                            {formatMoney(open)}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}

