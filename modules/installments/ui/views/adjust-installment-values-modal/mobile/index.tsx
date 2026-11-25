"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Hash, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { MoneyInput } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    WizardReviewCard,
    WizardReviewHint,
    WizardReviewRow,
    useWizard,
    type CustomStepProps,
    type WizardStep,
} from "@/components/wizard";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { civilToLocalNoon } from "@/modules/agreements/application/services/civil-date";
import { InstallmentDomainError } from "@/modules/installments/application/policies/installment.policy";
import { planInstallmentValuesReconciliation } from "@/modules/installments/application/services/installment-values-reconciliation.calculator";
import {
    MAX_INSTALLMENTS,
    MIN_INSTALLMENTS,
} from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import {
    AdjustInstallmentValuesSchema,
    type AdjustInstallmentValuesValues,
    type InstallmentValuesEditMode,
} from "@/modules/installments/models/schemas/installment-values.schema";
import { InstallmentWizardDrawer } from "../../../components/installment-action-modal-shell";
import type { AdjustInstallmentValuesModalProps } from "../types";

function formatMonthYear(dateStr: string | null): string {
    if (!dateStr) return "—";
    return format(civilToLocalNoon(dateStr), "MM/yyyy", { locale: ptBR });
}

interface LiveSummaryState {
    totalInstallments: number;
    installmentAmount: number;
    totalAmount: number;
}

/**
 * Resumo fixo centralizado no topo dos passos de edição em uma badge outline pequena:
 * ex.: "12x · R$ 100,00 · Total R$ 1.200,00"
 */
function ValuesSummaryBadge({ summary }: { summary: LiveSummaryState }) {
    const { step } = useWizard();
    if (step.id === "review") return null;

    return (
        <div className="flex justify-center pt-1">
            <Badge
                variant="outline"
                className="gap-1.5 px-2.5 py-1.5 bg-accent text-[11px] leading-none font-normal tabular-nums text-muted-foreground border-0 inline-flex items-center"
            >
                <span className="font-medium text-foreground">
                    {summary.totalInstallments}x
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-foreground">
                    {formatMoney(summary.installmentAmount)}
                </span>
                <span aria-hidden="true">·</span>
                <span>Total</span>
                <strong className="font-medium text-foreground">
                    {formatMoney(summary.totalAmount)}
                </strong>
            </Badge>
        </div>
    );
}

/** Etapa 1: Stepper de quantidade de parcelas + previsão de término. */
function MobileInstallmentsStepControl({
    installment,
    minTotalInstallments,
    onLiveChange,
}: {
    installment: InstallmentListItem;
    minTotalInstallments: number;
    onLiveChange: (next: LiveSummaryState) => void;
}) {
    const { setValue, control } = useFormContext<AdjustInstallmentValuesValues>();
    const [totalInstallments, editMode, installmentAmount, totalAmount] = useWatch({
        control,
        name: ["totalInstallments", "editMode", "installmentAmount", "totalAmount"],
    });

    const currentCount = Number(totalInstallments ?? installment.totalInstallments);

    const updateCount = (nextCount: number) => {
        const clamped = Math.max(
            minTotalInstallments,
            Math.min(MAX_INSTALLMENTS, nextCount)
        );
        setValue("totalInstallments", clamped, { shouldValidate: true });

        const targetOpen = Math.max(0, clamped - installment.consolidatedInstallments);
        let nextUnit = installmentAmount ?? 0;
        let nextTotal = totalAmount ?? 0;

        if ((editMode ?? "INSTALLMENT_AMOUNT") === "INSTALLMENT_AMOUNT") {
            nextTotal = Math.max(
                1,
                installment.consolidatedAmount + targetOpen * nextUnit
            );
            setValue("totalAmount", nextTotal, { shouldValidate: true });
        } else if (targetOpen > 0) {
            const remaining = Math.max(
                0,
                nextTotal - installment.consolidatedAmount
            );
            nextUnit = Math.max(1, Math.floor(remaining / targetOpen));
            setValue("installmentAmount", nextUnit, { shouldValidate: true });
        }

        onLiveChange({
            totalInstallments: clamped,
            installmentAmount: nextUnit,
            totalAmount: nextTotal,
        });
    };

    const previewEndsAt = React.useMemo(() => {
        try {
            const mode = editMode ?? "INSTALLMENT_AMOUNT";
            const target =
                mode === "INSTALLMENT_AMOUNT"
                    ? Number(installmentAmount ?? 0)
                    : Number(totalAmount ?? 0);
            const plan = planInstallmentValuesReconciliation({
                totalInstallments: installment.totalInstallments,
                consolidatedInstallments: installment.consolidatedInstallments,
                consolidatedAmount: installment.consolidatedAmount,
                endsAt: installment.endsAt,
                newTotalInstallments: currentCount,
                editMode: mode,
                targetAmount: target,
            });
            return plan.newEndsAt;
        } catch {
            return installment.endsAt;
        }
    }, [
        installment.totalInstallments,
        installment.consolidatedInstallments,
        installment.consolidatedAmount,
        installment.endsAt,
        currentCount,
        editMode,
        installmentAmount,
        totalAmount,
    ]);

    return (
        <div className="flex flex-col items-center gap-3.5 py-5">
            <div className="flex items-center justify-center gap-7">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateCount(currentCount - 1)}
                    disabled={currentCount <= minTotalInstallments}
                    aria-label="Diminuir 1 parcela"
                    className="size-11 rounded-full border-input"
                >
                    <Minus className="size-4" />
                </Button>

                <span className="min-w-14 text-center font-mono text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                    {currentCount}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateCount(currentCount + 1)}
                    disabled={currentCount >= MAX_INSTALLMENTS}
                    aria-label="Aumentar 1 parcela"
                    className="size-11 rounded-full border-input"
                >
                    <Plus className="size-4" />
                </Button>
            </div>

            <span className="text-xs text-muted-foreground tabular-nums">
                Término previsto:{" "}
                <strong className="font-mono font-medium text-foreground">
                    {formatMonthYear(previewEndsAt)}
                </strong>
            </span>
        </div>
    );
}

/** Etapa 2: Input monetário centralizado + subtítulo + seletor "Por parcela" / "Total". */
function MobileAmountStepControl({
    installment,
    onLiveChange,
}: {
    installment: InstallmentListItem;
    onLiveChange: (next: LiveSummaryState) => void;
}) {
    const { setValue, control } = useFormContext<AdjustInstallmentValuesValues>();
    const [totalInstallments, editMode, installmentAmount, totalAmount] = useWatch({
        control,
        name: ["totalInstallments", "editMode", "installmentAmount", "totalAmount"],
    });

    const count = Number(totalInstallments ?? installment.totalInstallments);
    const isUnitMode = (editMode ?? "INSTALLMENT_AMOUNT") === "INSTALLMENT_AMOUNT";
    const activeValue = isUnitMode ? (installmentAmount ?? 0) : (totalAmount ?? 0);
    const targetOpen = Math.max(0, count - installment.consolidatedInstallments);

    const handleAmountChange = (nextValue: number) => {
        if (isUnitMode) {
            const nextTotal = Math.max(
                1,
                installment.consolidatedAmount + targetOpen * nextValue
            );
            setValue("installmentAmount", nextValue, { shouldValidate: true });
            setValue("totalAmount", nextTotal, { shouldValidate: true });
            onLiveChange({
                totalInstallments: count,
                installmentAmount: nextValue,
                totalAmount: nextTotal,
            });
        } else {
            let nextUnit = installmentAmount ?? 0;
            setValue("totalAmount", nextValue, { shouldValidate: true });
            if (targetOpen > 0) {
                const remaining = Math.max(
                    0,
                    nextValue - installment.consolidatedAmount
                );
                nextUnit = Math.max(1, Math.floor(remaining / targetOpen));
                setValue("installmentAmount", nextUnit, { shouldValidate: true });
            }
            onLiveChange({
                totalInstallments: count,
                installmentAmount: nextUnit,
                totalAmount: nextValue,
            });
        }
    };

    const handleModeChange = (nextMode: InstallmentValuesEditMode) => {
        setValue("editMode", nextMode, { shouldValidate: true });
    };

    const subtitle = isUnitMode
        ? `Total: ${formatMoney(totalAmount ?? 0)}`
        : targetOpen > 0
          ? `Parcela: ${formatMoney(installmentAmount ?? 0)}`
          : `Consolidado: ${formatMoney(installment.consolidatedAmount)}`;

    return (
        <div className="flex flex-col items-center gap-4 py-3">
            <div className="flex w-full flex-col items-center gap-1">
                <MoneyInput
                    value={activeValue}
                    onChange={(val) => handleAmountChange(val ?? 0)}
                    aria-label={isUnitMode ? "Valor por parcela" : "Valor total"}
                    className="w-full bg-transparent text-center font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums"
                />
                {/* <span className="text-xs text-muted-foreground font-mono tabular-nums">
                    {subtitle}
                </span> */}
            </div>

            <div
                role="radiogroup"
                aria-label="Modo de edição do valor"
                className="inline-flex items-center justify-center gap-1"
            >
                {(
                    [
                        { value: "INSTALLMENT_AMOUNT", label: "Por parcela" },
                        { value: "TOTAL_AMOUNT", label: "Total" },
                    ] as const
                ).map((option) => {
                    const active = (editMode ?? "INSTALLMENT_AMOUNT") === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => handleModeChange(option.value)}
                            className={cn(
                                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                                active
                                    ? "bg-muted text-foreground"
                                    : "bg-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdjustInstallmentValuesModalViewMobile({
    isOpen,
    installment,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: AdjustInstallmentValuesModalProps) {
    const minTotalInstallments = Math.max(
        installment.consolidatedInstallments,
        installment.consolidatedInstallments === 0 ? MIN_INSTALLMENTS : 1
    );

    const initialData = React.useMemo<AdjustInstallmentValuesValues>(
        () => ({
            totalInstallments: installment.totalInstallments,
            editMode: "INSTALLMENT_AMOUNT",
            installmentAmount: installment.installmentAmount,
            totalAmount: installment.totalAmount,
        }),
        [
            installment.totalInstallments,
            installment.installmentAmount,
            installment.totalAmount,
        ]
    );

    const [liveSummary, setLiveSummary] = React.useState<LiveSummaryState>({
        totalInstallments: installment.totalInstallments,
        installmentAmount: installment.installmentAmount,
        totalAmount: installment.totalAmount,
    });

    const reconciliationSchema = React.useMemo(
        () =>
            AdjustInstallmentValuesSchema.superRefine((data, ctx) => {
                try {
                    const targetAmount =
                        data.editMode === "INSTALLMENT_AMOUNT"
                            ? data.installmentAmount
                            : data.totalAmount;
                    planInstallmentValuesReconciliation({
                        totalInstallments: installment.totalInstallments,
                        consolidatedInstallments: installment.consolidatedInstallments,
                        consolidatedAmount: installment.consolidatedAmount,
                        endsAt: installment.endsAt,
                        newTotalInstallments: data.totalInstallments,
                        editMode: data.editMode,
                        targetAmount,
                    });
                } catch (error) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["installmentAmount"],
                        message:
                            error instanceof InstallmentDomainError
                                ? error.message
                                : "Valores inválidos para reconciliação.",
                    });
                }
            }),
        [
            installment.totalInstallments,
            installment.consolidatedInstallments,
            installment.consolidatedAmount,
            installment.endsAt,
        ]
    );

    const steps = React.useMemo<WizardStep<AdjustInstallmentValuesValues>[]>(() => {
        const ReviewContent = ({
            data,
        }: CustomStepProps<AdjustInstallmentValuesValues>) => {
            let plan = null;
            try {
                const editMode = data.editMode ?? "INSTALLMENT_AMOUNT";
                const targetAmount =
                    editMode === "INSTALLMENT_AMOUNT"
                        ? Number(data.installmentAmount ?? 0)
                        : Number(data.totalAmount ?? 0);
                plan = planInstallmentValuesReconciliation({
                    totalInstallments: installment.totalInstallments,
                    consolidatedInstallments: installment.consolidatedInstallments,
                    consolidatedAmount: installment.consolidatedAmount,
                    endsAt: installment.endsAt,
                    newTotalInstallments: Number(
                        data.totalInstallments ?? installment.totalInstallments
                    ),
                    editMode,
                    targetAmount,
                });
            } catch {
                plan = null;
            }

            if (!plan) return null;

            return (
                <div className="space-y-2.5 py-0.5">
                    <WizardReviewCard>
                        <WizardReviewRow
                            icon={<Hash className="size-4" />}
                            label="Parcelas & Término"
                            value={
                                <span className="text-sm font-semibold tabular-nums">
                                    {data.totalInstallments}x • até{" "}
                                    {formatMonthYear(plan.newEndsAt)}
                                </span>
                            }
                            stepId="installments"
                        />

                        <WizardReviewRow
                            icon={<SlidersHorizontal className="size-4" />}
                            label={`${plan.targetOpenCount}x em aberto de`}
                            value={
                                <span className="text-base font-bold font-mono tabular-nums">
                                    {formatMoney(plan.baseOpenAmount)}
                                </span>
                            }
                            stepId="amount"
                        />

                        <WizardReviewRow stepId="amount">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-[11px] text-muted-foreground block font-medium">
                                        Novo total
                                    </span>
                                    <span className="font-semibold font-mono tabular-nums text-foreground">
                                        {formatMoney(plan.newTotalAmount)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground block font-medium">
                                        Consolidadas
                                    </span>
                                    <span className="font-semibold font-mono tabular-nums text-foreground">
                                        {plan.consolidatedCount}x (
                                        {formatMoney(installment.consolidatedAmount)})
                                    </span>
                                </div>
                            </div>
                        </WizardReviewRow>
                    </WizardReviewCard>

                    <WizardReviewHint>
                        Válido apenas para as {plan.targetOpenCount}{" "}
                        {plan.targetOpenCount === 1
                            ? "parcela em aberto"
                            : "parcelas em aberto"}
                        {plan.consolidatedCount > 0 &&
                            ` (${plan.consolidatedCount} ${
                                plan.consolidatedCount === 1
                                    ? "consolidada mantida"
                                    : "consolidadas mantidas"
                            })`}
                        {plan.addedCount > 0 && `, +${plan.addedCount} nova(s)`}
                        {plan.cancelledCount > 0 &&
                            `, -${plan.cancelledCount} cancelada(s)`}
                        .
                        {plan.hasRemainder && (
                            <>
                                {" "}
                                Última parcela em aberto:{" "}
                                {formatMoney(plan.lastOpenAmount)}.
                            </>
                        )}
                    </WizardReviewHint>
                </div>
            );
        };

        return [
            {
                id: "installments",
                title: "Parcelas",
                schema: reconciliationSchema,
                fields: [
                    {
                        name: "totalInstallments",
                        children: () => (
                            <MobileInstallmentsStepControl
                                installment={installment}
                                minTotalInstallments={minTotalInstallments}
                                onLiveChange={setLiveSummary}
                            />
                        ),
                    },
                ],
            },
            {
                id: "amount",
                title: "Valor",
                schema: reconciliationSchema,
                fields: [
                    {
                        name: "installmentAmount",
                        children: () => (
                            <MobileAmountStepControl
                                installment={installment}
                                onLiveChange={setLiveSummary}
                            />
                        ),
                    },
                ],
            },
            {
                id: "review",
                title: "Resumo",
                submitText: "Confirmar ajuste",
                component: ReviewContent,
            },
        ];
    }, [installment, minTotalInstallments, reconciliationSchema]);

    return (
        <InstallmentWizardDrawer<AdjustInstallmentValuesValues>
            isOpen={isOpen}
            title="Ajustar valores e parcelas"
            description={`Reestruture a quantidade e o valor das parcelas em aberto de "${installment.description}".`}
            steps={steps}
            initialData={initialData}
            headerExtra={<ValuesSummaryBadge summary={liveSummary} />}
            onComplete={onSubmit}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        />
    );
}
