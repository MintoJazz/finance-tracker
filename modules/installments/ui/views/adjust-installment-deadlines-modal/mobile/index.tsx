"use client";

import * as React from "react";
import { ArrowRight, Calendar, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    WizardReviewCard,
    WizardReviewHint,
    WizardReviewRow,
    type CustomStepProps,
    type WizardStep,
} from "@/components/wizard";
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
import { InstallmentWizardDrawer } from "../../../components/installment-action-modal-shell";
import type { AdjustInstallmentDeadlinesModalProps } from "../types";

function extractCurrentDueDay(installment: InstallmentListItem): number {
    const ref = installment.nextDueDate ?? installment.purchaseDate;
    if (!ref) return 10;
    const day = Number(ref.slice(8, 10));
    return Number.isInteger(day) && day >= 1 && day <= 31 ? day : 10;
}

export default function AdjustInstallmentDeadlinesModalViewMobile({
    isOpen,
    installment,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: AdjustInstallmentDeadlinesModalProps) {
    const openCount = getOpenInstallmentsCount(installment);
    const initialData = React.useMemo<AdjustMonthlyDueDayValues>(
        () => ({ dueDay: extractCurrentDueDay(installment) }),
        [installment]
    );

    const steps = React.useMemo<WizardStep<AdjustMonthlyDueDayValues>[]>(() => {
        const ScopeContent = () => (
            <div className="flex flex-col gap-3 py-1">
                <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 text-xs leading-relaxed">
                        <span className="text-sm font-medium text-foreground">
                            Apenas parcelas em aberto
                        </span>
                        <p className="text-muted-foreground">
                            O novo dia de vencimento será aplicado apenas nas{" "}
                            <strong className="font-medium text-foreground">
                                {openCount}{" "}
                                {openCount === 1 ? "parcela em aberto" : "parcelas em aberto"}
                            </strong>
                            . Parcelas já consolidadas, valores e quantidade permanecem intocados.
                        </p>
                    </div>
                </div>
            </div>
        );

        const ReviewContent = ({
            data,
        }: CustomStepProps<AdjustMonthlyDueDayValues>) => {
            const dueDay = Number(data.dueDay);
            const preview =
                Number.isInteger(dueDay) && dueDay >= 1 && dueDay <= 31
                    ? planMonthlyDueDayAdjustment({
                          nextDueDate: installment.nextDueDate,
                          endsAt: installment.endsAt,
                          openCount,
                          newDueDay: dueDay,
                      })
                    : null;

            return (
                <div className="space-y-2.5 py-0.5">
                    <WizardReviewCard>
                        <WizardReviewRow
                            icon={<Calendar className="size-4" />}
                            label="Novo vencimento"
                            value={`Todo dia ${dueDay}`}
                            stepId="deadlines"
                        />

                        {preview?.previousNextDueDate && preview?.newNextDueDate && (
                            <WizardReviewRow
                                label="Próxima parcela"
                                value={
                                    <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                                        <span className="text-muted-foreground font-normal">
                                            {formatDate(preview.previousNextDueDate)}
                                        </span>
                                        <ArrowRight className="size-3 text-muted-foreground" />
                                        <strong>{formatDate(preview.newNextDueDate)}</strong>
                                    </span>
                                }
                                stepId="deadlines"
                            />
                        )}

                        {preview?.previousEndsAt && preview?.newEndsAt && (
                            <WizardReviewRow
                                label="Última parcela"
                                value={
                                    <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums">
                                        <span className="text-muted-foreground font-normal">
                                            {formatDate(preview.previousEndsAt)}
                                        </span>
                                        <ArrowRight className="size-3 text-muted-foreground" />
                                        <strong>{formatDate(preview.newEndsAt)}</strong>
                                    </span>
                                }
                                stepId="deadlines"
                            />
                        )}

                        <WizardReviewRow
                            icon={<ShieldCheck className="size-4" />}
                            label="Vigência do ajuste"
                            value={`${openCount} ${
                                openCount === 1 ? "parcela em aberto" : "parcelas em aberto"
                            }`}
                            stepId="scope"
                        />
                    </WizardReviewCard>

                    <WizardReviewHint>
                        Meses com menos dias ajustam automaticamente ao último dia do mês.
                    </WizardReviewHint>
                </div>
            );
        };

        return [
            {
                id: "deadlines",
                title: "Dia de vencimento",
                schema: AdjustMonthlyDueDaySchema,
                fields: [
                    {
                        name: "dueDay",
                        label: "Novo dia de vencimento (1 a 31)",
                        children: (_ctx, field) => (
                            <Input
                                type="number"
                                min={1}
                                max={31}
                                step={1}
                                value={
                                    typeof field.value === "number" && field.value > 0
                                        ? field.value
                                        : ""
                                }
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value === "" ? 0 : Number(e.target.value)
                                    )
                                }
                                onBlur={field.onBlur}
                                className="font-mono tabular-nums"
                            />
                        ),
                    },
                ],
            },
            {
                id: "scope",
                title: "Vigência do ajuste",
                component: ScopeContent,
            },
            {
                id: "review",
                title: "Resumo",
                submitText: "Salvar vencimento",
                component: ReviewContent,
            },
        ];
    }, [installment.nextDueDate, installment.endsAt, openCount]);

    return (
        <InstallmentWizardDrawer<AdjustMonthlyDueDayValues>
            isOpen={isOpen}
            title="Ajustar dia de vencimento"
            description={`Altere o dia de vencimento das parcelas em aberto de "${installment.description}".`}
            steps={steps}
            initialData={initialData}
            onComplete={onSubmit}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        />
    );
}
