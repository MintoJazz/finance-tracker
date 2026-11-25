"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { MoneyInput } from "@/components/form";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InstallmentDomainError } from "@/modules/installments/application/policies/installment.policy";
import {
    planInstallmentValuesReconciliation,
    type InstallmentValuesReconciliationPlan,
} from "@/modules/installments/application/services/installment-values-reconciliation.calculator";
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
import { InstallmentValuesPreviewCard } from "./preview-card";

const MONEY_INPUT_CLASS =
    "flex h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 font-mono text-lg font-medium tabular-nums transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80";

export interface InstallmentValuesFormProps {
    formId: string;
    installment: InstallmentListItem;
    onSubmit: (values: AdjustInstallmentValuesValues) => Promise<void>;
    onSubmittingChange?: (isSubmitting: boolean) => void;
    onValidityChange?: (isValid: boolean) => void;
}

/**
 * Fluxo exclusivo de **Valores e Parcelas**: sincroniza Valor da Parcela <-> Valor Total
 * e quantidade total `N` sobre a cauda em aberto, sem alterar vencimentos das parcelas mantidas.
 */
export function InstallmentValuesForm({
    formId,
    installment,
    onSubmit,
    onSubmittingChange,
    onValidityChange,
}: InstallmentValuesFormProps) {
    const minTotalInstallments = Math.max(
        installment.consolidatedInstallments,
        installment.consolidatedInstallments === 0 ? MIN_INSTALLMENTS : 1
    );

    const form = useForm<AdjustInstallmentValuesValues>({
        resolver: zodResolver(AdjustInstallmentValuesSchema),
        defaultValues: {
            totalInstallments: installment.totalInstallments,
            editMode: "INSTALLMENT_AMOUNT",
            installmentAmount: installment.installmentAmount,
            totalAmount: installment.totalAmount,
        },
    });

    const isSubmitting = form.formState.isSubmitting;
    React.useEffect(() => {
        onSubmittingChange?.(isSubmitting);
    }, [isSubmitting, onSubmittingChange]);

    const totalInstallments = form.watch("totalInstallments");
    const editMode = form.watch("editMode");
    const installmentAmount = form.watch("installmentAmount");
    const totalAmount = form.watch("totalAmount");

    const isUnitMode = editMode === "INSTALLMENT_AMOUNT";
    const currentCount = Number(totalInstallments) || 0;

    const { plan, domainError } = React.useMemo<{
        plan: InstallmentValuesReconciliationPlan | null;
        domainError: string | null;
    }>(() => {
        try {
            const targetAmount =
                editMode === "INSTALLMENT_AMOUNT" ? installmentAmount : totalAmount;
            const computed = planInstallmentValuesReconciliation({
                totalInstallments: installment.totalInstallments,
                consolidatedInstallments: installment.consolidatedInstallments,
                consolidatedAmount: installment.consolidatedAmount,
                endsAt: installment.endsAt,
                newTotalInstallments: Number(totalInstallments),
                editMode,
                targetAmount: Number(targetAmount),
            });
            return { plan: computed, domainError: null };
        } catch (error) {
            if (error instanceof InstallmentDomainError) {
                return { plan: null, domainError: error.message };
            }
            return { plan: null, domainError: "Verifique os valores informados." };
        }
    }, [
        installment.totalInstallments,
        installment.consolidatedInstallments,
        installment.consolidatedAmount,
        installment.endsAt,
        totalInstallments,
        editMode,
        installmentAmount,
        totalAmount,
    ]);

    React.useEffect(() => {
        onValidityChange?.(Boolean(plan) && !domainError);
    }, [plan, domainError, onValidityChange]);

    const handleInstallmentsChange = (nextCount: number) => {
        form.setValue("totalInstallments", nextCount, { shouldValidate: true });
        const targetOpen = Math.max(0, nextCount - installment.consolidatedInstallments);
        if (editMode === "INSTALLMENT_AMOUNT") {
            const nextTotal =
                installment.consolidatedAmount + targetOpen * (installmentAmount || 0);
            form.setValue("totalAmount", Math.max(1, nextTotal), { shouldValidate: true });
        } else if (targetOpen > 0) {
            const remaining = Math.max(0, (totalAmount || 0) - installment.consolidatedAmount);
            const nextUnit = Math.floor(remaining / targetOpen);
            form.setValue("installmentAmount", Math.max(1, nextUnit), {
                shouldValidate: true,
            });
        }
    };

    const handleStepInstallments = (delta: number) => {
        const base = currentCount > 0 ? currentCount : minTotalInstallments;
        const clamped = Math.max(
            minTotalInstallments,
            Math.min(MAX_INSTALLMENTS, base + delta)
        );
        handleInstallmentsChange(clamped);
    };

    const handleInstallmentAmountChange = (nextUnit: number) => {
        form.setValue("editMode", "INSTALLMENT_AMOUNT");
        form.setValue("installmentAmount", nextUnit, { shouldValidate: true });
        const targetOpen = Math.max(
            0,
            Number(totalInstallments || 0) - installment.consolidatedInstallments
        );
        const nextTotal = installment.consolidatedAmount + targetOpen * nextUnit;
        form.setValue("totalAmount", Math.max(1, nextTotal), { shouldValidate: true });
    };

    const handleTotalAmountChange = (nextTotal: number) => {
        form.setValue("editMode", "TOTAL_AMOUNT");
        form.setValue("totalAmount", nextTotal, { shouldValidate: true });
        const targetOpen = Math.max(
            0,
            Number(totalInstallments || 0) - installment.consolidatedInstallments
        );
        if (targetOpen > 0) {
            const remaining = Math.max(0, nextTotal - installment.consolidatedAmount);
            const nextUnit = Math.floor(remaining / targetOpen);
            form.setValue("installmentAmount", Math.max(1, nextUnit), {
                shouldValidate: true,
            });
        }
    };

    const handleEditModeChange = (nextMode: InstallmentValuesEditMode) => {
        form.setValue("editMode", nextMode, { shouldValidate: true });
    };

    return (
        <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-[1.15fr_1fr] gap-5 items-stretch"
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="values-total-installments">
                        Quantidade de parcelas
                    </Label>
                    <Controller
                        control={form.control}
                        name="totalInstallments"
                        render={({ field }) => (
                            <InputGroup className="h-10">
                                <InputGroupAddon align="inline-start">
                                    <InputGroupButton
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() => handleStepInstallments(-1)}
                                        disabled={currentCount <= minTotalInstallments}
                                        aria-label="Diminuir 1 parcela"
                                    >
                                        <Minus className="size-4" />
                                    </InputGroupButton>
                                </InputGroupAddon>

                                <InputGroupInput
                                    id="values-total-installments"
                                    type="number"
                                    min={minTotalInstallments}
                                    max={MAX_INSTALLMENTS}
                                    step={1}
                                    value={
                                        typeof field.value === "number" && field.value > 0
                                            ? field.value
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const parsed =
                                            e.target.value === ""
                                                ? 0
                                                : Number(e.target.value);
                                        handleInstallmentsChange(parsed);
                                    }}
                                    onBlur={field.onBlur}
                                    className="text-center font-mono text-base font-medium tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />

                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() => handleStepInstallments(1)}
                                        disabled={currentCount >= MAX_INSTALLMENTS}
                                        aria-label="Aumentar 1 parcela"
                                    >
                                        <Plus className="size-4" />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        )}
                    />
                    <span className="text-xs text-muted-foreground">
                        Mínimo de {minTotalInstallments}, sem reduzir abaixo do consolidado.
                    </span>
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="values-active-amount">
                            {isUnitMode ? "Valor da parcela" : "Valor total"}
                        </Label>

                        <div
                            role="radiogroup"
                            aria-label="Modo de edição do valor"
                            className="inline-flex items-center gap-1"
                        >
                            {(
                                [
                                    { value: "INSTALLMENT_AMOUNT", label: "Parcela" },
                                    { value: "TOTAL_AMOUNT", label: "Total" },
                                ] as const
                            ).map((option) => {
                                const active = editMode === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => handleEditModeChange(option.value)}
                                        className={cn(
                                            "rounded-full px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
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

                    {isUnitMode ? (
                        <Controller
                            control={form.control}
                            name="installmentAmount"
                            render={({ field }) => (
                                <MoneyInput
                                    id="values-active-amount"
                                    value={field.value}
                                    onChange={(val) =>
                                        handleInstallmentAmountChange(val ?? 0)
                                    }
                                    onBlur={field.onBlur}
                                    placeholder="R$ 0,00"
                                    className={MONEY_INPUT_CLASS}
                                />
                            )}
                        />
                    ) : (
                        <Controller
                            control={form.control}
                            name="totalAmount"
                            render={({ field }) => (
                                <MoneyInput
                                    id="values-active-amount"
                                    value={field.value}
                                    onChange={(val) => handleTotalAmountChange(val ?? 0)}
                                    onBlur={field.onBlur}
                                    placeholder="R$ 0,00"
                                    className={MONEY_INPUT_CLASS}
                                />
                            )}
                        />
                    )}

                    <span className="text-xs text-muted-foreground">
                        {isUnitMode
                            ? "O total é recalculado ao mudar a parcela."
                            : "A parcela é recalculada ao mudar o total."}
                    </span>
                </div>
            </div>

            <InstallmentValuesPreviewCard
                plan={plan}
                consolidatedAmount={installment.consolidatedAmount}
                errorMessage={domainError}
            />
        </form>
    );
}
