"use client";

import * as React from "react";
import { Layers, Sparkles, Tags } from "lucide-react";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    WizardReviewCard,
    WizardReviewHint,
    WizardReviewRow,
    type CustomStepProps,
    type WizardStep,
} from "@/components/wizard";
import { cn } from "@/lib/utils";
import {
    InstallmentCategoryScopeSchema,
    type ChangeInstallmentCategoryValues,
    type InstallmentCategoryScope,
} from "@/modules/installments/models/schemas/installment-category.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
    getOpenInstallmentsCount,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";
import { describeClassification } from "@/modules/recurrences/ui/utils/recurrence-classification.utils";
import { InstallmentWizardDrawer } from "../../../components/installment-action-modal-shell";
import {
    installmentCategoryStep,
    installmentNewEntitySteps,
    installmentSubcategoryStep,
} from "../../../components/installment-wizard/steps/classification.steps";
import type { ChangeInstallmentCategoryModalProps } from "../types";

const ScopeStepSchema = z.object({
    scope: InstallmentCategoryScopeSchema,
});

function resolveInitialCategory(
    installment: InstallmentListItem,
    options: InstallmentFormOptions
): { categoryId: number | null; subcategoryId: number | null } {
    const currentId = installment.category?.balanceId ?? null;
    if (!currentId) return { categoryId: null, subcategoryId: null };

    const matchingSub = options.subcategories.find((s) => s.id === currentId);
    if (matchingSub) {
        return { categoryId: matchingSub.parentId, subcategoryId: matchingSub.id };
    }
    const matchingCat = options.categories.find((c) => c.id === currentId);
    if (matchingCat) {
        return { categoryId: matchingCat.id, subcategoryId: null };
    }
    return { categoryId: null, subcategoryId: null };
}

function ScopeControl({
    value,
    onChange,
    openCount,
    totalInstallments,
}: {
    value: InstallmentCategoryScope;
    onChange: (value: InstallmentCategoryScope) => void;
    openCount: number;
    totalInstallments: number;
}) {
    const hasOpenParcels = openCount > 0;

    return (
        <RadioGroup
            value={value}
            onValueChange={(next) => onChange(next as InstallmentCategoryScope)}
            className="flex flex-col gap-2.5"
        >
            {hasOpenParcels && (
                <label
                    htmlFor="mobile-scope-open-only"
                    className={cn(
                        "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                        value === "OPEN_ONLY"
                            ? "border-primary bg-primary/5"
                            : "border-border/70 hover:bg-muted/30"
                    )}
                >
                    <RadioGroupItem
                        id="mobile-scope-open-only"
                        value="OPEN_ONLY"
                        className="mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                            Aplicar apenas às parcelas em aberto
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Altera {openCount}{" "}
                            {openCount === 1 ? "parcela em aberto" : "parcelas em aberto"} e
                            preserva as consolidadas.
                        </span>
                    </div>
                </label>
            )}

            <label
                htmlFor="mobile-scope-all"
                className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                    value === "ALL"
                        ? "border-primary bg-primary/5"
                        : "border-border/70 hover:bg-muted/30"
                )}
            >
                <RadioGroupItem
                    id="mobile-scope-all"
                    value="ALL"
                    className="mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                        Aplicar a todo o parcelamento
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Reclassifica todas as {totalInstallments}{" "}
                        {totalInstallments === 1 ? "parcela" : "parcelas"} (incluindo
                        consolidadas).
                    </span>
                </div>
            </label>
        </RadioGroup>
    );
}

function NewBadge() {
    return (
        <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary align-middle">
            <Sparkles className="size-2.5" />
            nova
        </span>
    );
}

export default function ChangeInstallmentCategoryModalViewMobile({
    isOpen,
    installment,
    options,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: ChangeInstallmentCategoryModalProps) {
    const openCount = getOpenInstallmentsCount(installment);
    const initial = React.useMemo(
        () => resolveInitialCategory(installment, options),
        [installment, options]
    );

    const initialData = React.useMemo<ChangeInstallmentCategoryValues>(
        () => ({
            categoryId: initial.categoryId,
            newCategory: null,
            subcategoryId: initial.subcategoryId,
            newSubcategory: null,
            scope: openCount > 0 ? "OPEN_ONLY" : "ALL",
        }),
        [initial.categoryId, initial.subcategoryId, openCount]
    );

    const steps = React.useMemo<WizardStep<ChangeInstallmentCategoryValues>[]>(() => {
        const asStep = (s: unknown) =>
            s as WizardStep<ChangeInstallmentCategoryValues>;
        const asList = (s: unknown) =>
            s as WizardStep<ChangeInstallmentCategoryValues>[];

        const ReviewContent = ({
            data,
        }: CustomStepProps<ChangeInstallmentCategoryValues>) => {
            const classification = describeClassification(data, options);
            const isAll = data.scope === "ALL";
            const affected = isAll ? installment.totalInstallments : openCount;

            return (
                <div className="space-y-2.5 py-0.5">
                    <WizardReviewCard>
                        <WizardReviewRow
                            icon={<Tags className="size-4" />}
                            label="Nova categoria"
                            value={
                                <span className="text-sm font-semibold">
                                    {classification.category ?? "—"}
                                    {classification.isNewCategory && <NewBadge />}
                                    <span className="mx-1 text-muted-foreground">›</span>
                                    {classification.subcategory ?? "—"}
                                    {classification.isNewSubcategory && <NewBadge />}
                                </span>
                            }
                            stepId="category"
                        />

                        <WizardReviewRow
                            icon={<Layers className="size-4" />}
                            label="Vigência do ajuste"
                            value={
                                isAll
                                    ? `Todo o parcelamento (${affected}x)`
                                    : `Apenas parcelas em aberto (${affected}x)`
                            }
                            stepId="scope"
                        />
                    </WizardReviewCard>

                    <WizardReviewHint>
                        A identificação visual do parcelamento (ícone e cor) será atualizada
                        automaticamente para a nova categoria.
                    </WizardReviewHint>
                </div>
            );
        };

        return [
            asStep(installmentCategoryStep(options)),
            ...asList(installmentNewEntitySteps("category", options)),
            asStep(installmentSubcategoryStep(options)),
            ...asList(installmentNewEntitySteps("subcategory", options)),
            {
                id: "scope",
                title: "Vigência do ajuste",
                schema: ScopeStepSchema,
                fields: [
                    {
                        name: "scope",
                        children: (_ctx, field) => (
                            <ScopeControl
                                value={
                                    (field.value as InstallmentCategoryScope) ??
                                    (openCount > 0 ? "OPEN_ONLY" : "ALL")
                                }
                                onChange={field.onChange}
                                openCount={openCount}
                                totalInstallments={installment.totalInstallments}
                            />
                        ),
                    },
                ],
            },
            {
                id: "review",
                title: "Resumo",
                submitText: "Confirmar troca",
                component: ReviewContent,
            },
        ];
    }, [options, installment.totalInstallments, openCount]);

    return (
        <InstallmentWizardDrawer<ChangeInstallmentCategoryValues>
            isOpen={isOpen}
            title="Trocar categoria"
            description={`Escolha a nova categoria para "${installment.description}".`}
            steps={steps}
            initialData={initialData}
            pruneInactive={true}
            onComplete={onSubmit}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        />
    );
}
