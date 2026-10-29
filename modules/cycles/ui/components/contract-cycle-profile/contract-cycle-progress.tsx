"use client";

import * as React from "react";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ContractCycleProfile } from "@/modules/cycles/models/contract-cycle.schema";

interface ContractCycleProgressProps {
    cycle: ContractCycleProfile;
    className?: string;
}

export function ContractCycleProgress({
    cycle,
    className,
}: ContractCycleProgressProps) {
    const { expectedAmount, paidAmount, transferredAmount, openAmount, status } =
        cycle;

    const total = expectedAmount > 0 ? expectedAmount : 1;
    const paidPercentage = Math.min(
        100,
        Math.max(0, (paidAmount / total) * 100)
    );
    const transferredPercentage = Math.min(
        100 - paidPercentage,
        Math.max(0, (transferredAmount / total) * 100)
    );

    const isOverdue = status === "OVERDUE" && openAmount > 0;

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {/* Barra multicamadas */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80 flex">
                {paidPercentage > 0 && (
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${paidPercentage}%` }}
                        title={`Pago: ${paidPercentage.toFixed(0)}%`}
                    />
                )}
                {transferredPercentage > 0 && (
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${transferredPercentage}%` }}
                        title={`Transferido: ${transferredPercentage.toFixed(0)}%`}
                    />
                )}
                {isOverdue && (
                    <div
                        className="h-full bg-rose-500/80 transition-all duration-300 flex-1"
                        title="Em aberto (vencido)"
                    />
                )}
            </div>

            {/* Legenda de valores */}
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground flex-wrap tabular-nums font-mono">
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>
                        Pago:{" "}
                        <strong className="font-semibold text-foreground">
                            {formatMoney(paidAmount)}
                        </strong>
                    </span>
                </div>

                {transferredAmount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                        <span>
                            Transferido:{" "}
                            <strong className="font-semibold text-foreground">
                                {formatMoney(transferredAmount)}
                            </strong>
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            "size-2 rounded-full shrink-0",
                            isOverdue ? "bg-rose-500" : "bg-muted-foreground/40"
                        )}
                    />
                    <span>
                        Em aberto:{" "}
                        <strong
                            className={cn(
                                "font-semibold",
                                isOverdue
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-foreground"
                            )}
                        >
                            {formatMoney(openAmount)}
                        </strong>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ContractCycleProgress;
