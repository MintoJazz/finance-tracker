"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Wizard,
    WizardDialogLayout,
    WizardNext,
    useWizard,
    type WizardStep,
} from "@/components/wizard";
import { cn } from "@/lib/utils";
import {
    ChangeInstallmentCategoryMainStepSchema,
    type ChangeInstallmentCategoryValues,
    type InstallmentCategoryScope,
} from "@/modules/installments/models/schemas/installment-category.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
    getOpenInstallmentsCount,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";
import type { FormFieldRow } from "@/types/form.types";
import { installmentClassificationRow } from "../installment-form/classification-fields";
import {
    installmentNewCategoryStep,
    installmentNewSubcategoryStep,
} from "../installment-wizard/steps/classification.steps";

export interface InstallmentCategoryFormProps {
    installment: InstallmentListItem;
    options: InstallmentFormOptions;
    onSubmit: (values: ChangeInstallmentCategoryValues) => Promise<void>;
    onClose: () => void;
    className?: string;
}

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

function CategoryDialogFooter({ onClose }: { onClose: () => void }) {
    const { isFirst, isLast, isSubmitting, back } = useWizard();

    return (
        <DialogFooter className="-mx-5 -mb-5 mt-auto flex-row justify-end gap-2 border-t border-border/60 bg-muted/30 px-5 py-3 rounded-b-xl">
            <Button
                type="button"
                variant="outline"
                onClick={isFirst ? onClose : back}
                disabled={isSubmitting}
            >
                {isFirst ? "Cancelar" : "Voltar"}
            </Button>
            <WizardNext>{isLast ? "Salvar" : "Continuar"}</WizardNext>
        </DialogFooter>
    );
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
            className="flex flex-col gap-2"
        >
            {hasOpenParcels && (
                <label
                    htmlFor="scope-open-only"
                    className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                        value === "OPEN_ONLY"
                            ? "border-primary bg-primary/5"
                            : "border-border/70 hover:bg-muted/30"
                    )}
                >
                    <RadioGroupItem
                        id="scope-open-only"
                        value="OPEN_ONLY"
                        className="mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                            Aplicar apenas às parcelas em aberto
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Altera {openCount}{" "}
                            {openCount === 1
                                ? "parcela em aberto"
                                : "parcelas em aberto"}{" "}
                            e preserva a categoria nas consolidadas.
                        </span>
                    </div>
                </label>
            )}

            <label
                htmlFor="scope-all"
                className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    value === "ALL"
                        ? "border-primary bg-primary/5"
                        : "border-border/70 hover:bg-muted/30"
                )}
            >
                <RadioGroupItem id="scope-all" value="ALL" className="mt-0.5" />
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

/**
 * Wizard desktop de troca de categoria: reutiliza exatamente os mesmos seletores
 * (comboboxes de categoria/subcategoria + passos condicionais de criação) do
 * formulário desktop de criação de parcelamentos.
 */
export function InstallmentCategoryForm({
    installment,
    options,
    onSubmit,
    onClose,
    className,
}: InstallmentCategoryFormProps) {
    const openCount = getOpenInstallmentsCount(installment);
    const hasOpenParcels = openCount > 0;

    const initialData = React.useMemo<ChangeInstallmentCategoryValues>(() => {
        const initial = resolveInitialCategory(installment, options);
        return {
            categoryId: initial.categoryId,
            newCategory: null,
            subcategoryId: initial.subcategoryId,
            newSubcategory: null,
            scope: hasOpenParcels ? "OPEN_ONLY" : "ALL",
        };
    }, [installment, options, hasOpenParcels]);

    const steps = React.useMemo<WizardStep<ChangeInstallmentCategoryValues>[]>(() => {
        const asStep = (s: unknown) =>
            s as WizardStep<ChangeInstallmentCategoryValues>;
        const classificationRow = installmentClassificationRow(
            options
        ) as unknown as FormFieldRow<ChangeInstallmentCategoryValues>;

        return [
            {
                id: "main",
                title: "Trocar categoria",
                description: `Escolha a nova categoria para "${installment.description}" e defina o escopo.`,
                schema: ChangeInstallmentCategoryMainStepSchema,
                fields: [
                    classificationRow,
                    {
                        name: "scope",
                        label: "Escopo da alteração",
                        children: (_ctx, field) => (
                            <ScopeControl
                                value={
                                    (field.value as InstallmentCategoryScope) ??
                                    (hasOpenParcels ? "OPEN_ONLY" : "ALL")
                                }
                                onChange={field.onChange}
                                openCount={openCount}
                                totalInstallments={installment.totalInstallments}
                            />
                        ),
                    },
                ],
            },
            asStep(installmentNewCategoryStep()),
            asStep(installmentNewSubcategoryStep(options)),
        ];
    }, [
        options,
        installment.description,
        installment.totalInstallments,
        hasOpenParcels,
        openCount,
    ]);

    return (
        <Wizard<ChangeInstallmentCategoryValues>
            steps={steps}
            initialData={initialData}
            onComplete={onSubmit}
            onClose={onClose}
            pruneInactive={true}
            className={cn("flex min-h-0 flex-1 flex-col", className)}
        >
            <WizardDialogLayout
                hideProgressWhenSingle
                footer={<CategoryDialogFooter onClose={onClose} />}
            />
        </Wizard>
    );
}
