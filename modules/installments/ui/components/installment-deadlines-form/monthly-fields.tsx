"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Calendar } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/formatters";
import { planMonthlyDueDayAdjustment } from "@/modules/installments/application/services/installment-deadlines.calculator";
import {
    AdjustMonthlyDueDaySchema,
    type AdjustMonthlyDueDayValues,
} from "@/modules/installments/models/schemas/installment-deadlines.schema";
import {
    getOpenInstallmentsCount,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";

export interface MonthlyDeadlinesFormProps {
    formId: string;
    installment: InstallmentListItem;
    onSubmit: (values: AdjustMonthlyDueDayValues) => Promise<void>;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}

function extractCurrentDueDay(installment: InstallmentListItem): number {
    const ref = installment.nextDueDate ?? installment.purchaseDate;
    if (!ref) return 10;
    const day = Number(ref.slice(8, 10));
    return Number.isInteger(day) && day >= 1 && day <= 31 ? day : 10;
}

/** Fluxo exclusivo de Prazos — Mês a Mês: altera apenas o dia de vencimento das parcelas em aberto. */
export function MonthlyDeadlinesForm({
    formId,
    installment,
    onSubmit,
    onSubmittingChange,
}: MonthlyDeadlinesFormProps) {
    const initialDay = extractCurrentDueDay(installment);
    const openCount = getOpenInstallmentsCount(installment);

    const form = useForm<AdjustMonthlyDueDayValues>({
        resolver: zodResolver(AdjustMonthlyDueDaySchema),
        defaultValues: { dueDay: initialDay },
    });

    const isSubmitting = form.formState.isSubmitting;
    React.useEffect(() => {
        onSubmittingChange?.(isSubmitting);
    }, [isSubmitting, onSubmittingChange]);

    const dueDay = form.watch("dueDay");

    const preview = React.useMemo(() => {
        if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) return null;
        return planMonthlyDueDayAdjustment({
            nextDueDate: installment.nextDueDate,
            endsAt: installment.endsAt,
            openCount,
            newDueDay: dueDay,
        });
    }, [installment.nextDueDate, installment.endsAt, openCount, dueDay]);

    return (
        <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="monthly-due-day">Novo dia de vencimento (1 a 31)</Label>
                <Controller
                    control={form.control}
                    name="dueDay"
                    render={({ field }) => (
                        <Input
                            id="monthly-due-day"
                            type="number"
                            min={1}
                            max={31}
                            step={1}
                            value={typeof field.value === "number" && field.value > 0 ? field.value : ""}
                            onChange={(e) =>
                                field.onChange(
                                    e.target.value === "" ? 0 : Number(e.target.value)
                                )
                            }
                            onBlur={field.onBlur}
                            className="font-mono tabular-nums"
                        />
                    )}
                />
                {form.formState.errors.dueDay ? (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.dueDay.message}
                    </p>
                ) : (
                    <span className="text-[11px] text-muted-foreground">
                        Afeta apenas as {openCount}{" "}
                        {openCount === 1 ? "parcela em aberto" : "parcelas em aberto"}. Meses
                        curtos ajustam automaticamente ao último dia do mês.
                    </span>
                )}
            </div>

            {preview && (
                <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/30 p-3.5 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span>Prévia das novas datas</span>
                    </div>

                    {preview.previousNextDueDate && preview.newNextDueDate && (
                        <div className="flex items-center justify-between gap-2 text-muted-foreground">
                            <span>Próximo vencimento</span>
                            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-foreground">
                                {formatDate(preview.previousNextDueDate)}
                                <ArrowRight className="size-3 text-muted-foreground" />
                                <strong>{formatDate(preview.newNextDueDate)}</strong>
                            </span>
                        </div>
                    )}

                    {preview.previousEndsAt && preview.newEndsAt && (
                        <div className="flex items-center justify-between gap-2 text-muted-foreground">
                            <span>Última parcela</span>
                            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-foreground">
                                {formatDate(preview.previousEndsAt)}
                                <ArrowRight className="size-3 text-muted-foreground" />
                                <strong>{formatDate(preview.newEndsAt)}</strong>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}
