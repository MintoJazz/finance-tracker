"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/formatters";
import { civilToLocalNoon } from "@/modules/agreements/application/services/civil-date";
import type { InstallmentValuesReconciliationPlan } from "@/modules/installments/application/services/installment-values-reconciliation.calculator";

function formatMonthYear(dateStr: string | null): string {
    if (!dateStr) return "—";
    return format(civilToLocalNoon(dateStr), "MM/yyyy", { locale: ptBR });
}

export interface InstallmentValuesPreviewCardProps {
    plan: InstallmentValuesReconciliationPlan | null;
    consolidatedAmount?: number;
    errorMessage?: string | null;
}

export function InstallmentValuesPreviewCard({
    plan,
    consolidatedAmount = 0,
    errorMessage,
}: InstallmentValuesPreviewCardProps) {
    if (errorMessage) {
        return (
            <div className="flex items-center rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-xs text-destructive">
                {errorMessage}
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-xs">
            <div className="flex flex-col gap-2.5">
                <div className="flex min-h-5 items-center justify-between gap-2">
                    <span className="font-medium text-muted-foreground">
                        Resumo da reconciliação
                    </span>
                    {plan.addedCount > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] leading-none font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                            +{plan.addedCount}{" "}
                            {plan.addedCount === 1 ? "nova" : "novas"}
                        </span>
                    )}
                    {plan.cancelledCount > 0 && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] leading-none font-medium tabular-nums text-amber-700 dark:text-amber-400">
                            -{plan.cancelledCount}{" "}
                            {plan.cancelledCount === 1 ? "cancelada" : "canceladas"}
                        </span>
                    )}
                </div>

                <dl className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">
                            Consolidadas (mantidas)
                        </dt>
                        <dd className="font-mono font-medium tabular-nums text-foreground">
                            {plan.consolidatedCount > 0
                                ? `${plan.consolidatedCount} (${formatMoney(consolidatedAmount)})`
                                : plan.consolidatedCount}
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Em aberto</dt>
                        <dd className="font-mono font-medium tabular-nums text-foreground">
                            {plan.targetOpenCount}{" "}
                            {plan.targetOpenCount === 1 ? "parcela" : "parcelas"}
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Nova parcela</dt>
                        <dd className="font-mono font-medium tabular-nums text-foreground">
                            {plan.targetOpenCount > 0
                                ? formatMoney(plan.baseOpenAmount)
                                : "—"}
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Término previsto</dt>
                        <dd className="font-mono font-medium tabular-nums text-foreground">
                            {formatMonthYear(plan.newEndsAt)}
                        </dd>
                    </div>
                </dl>

                {plan.hasRemainder && (
                    <span className="text-[11px] text-muted-foreground">
                        Última parcela em{" "}
                        <strong className="font-mono font-medium tabular-nums text-foreground">
                            {formatMoney(plan.lastOpenAmount)}
                        </strong>
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <Separator className="bg-border/60" />
                <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                        Novo total
                    </span>
                    <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {formatMoney(plan.newTotalAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
}
