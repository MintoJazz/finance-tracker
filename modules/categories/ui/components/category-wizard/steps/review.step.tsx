"use client";

import * as React from "react";
import {
  WizardReviewCard,
  WizardReviewRow,
  WizardReviewHint,
  type CustomStepProps,
  type WizardStep,
} from "@/components/wizard";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  type CategoryFormValues,
} from "@/modules/categories/models/category.schema";
import type { CategoryParentSummary } from "../../category-form/types";

export function CategoryReviewContent({
  data,
  parentCategory,
}: CustomStepProps<CategoryFormValues> & {
  parentCategory?: CategoryParentSummary | null;
}) {
  const resolvedIcon = data.icon || DEFAULT_CATEGORY_ICON;
  const resolvedColor = (data.color || DEFAULT_CATEGORY_COLOR).toUpperCase();
  const isSubcategory = Boolean(parentCategory);

  return (
    <div className="space-y-2.5 py-0.5">
      <WizardReviewCard>
        {/* Linha 1: Nome da Categoria / Subcategoria */}
        <WizardReviewRow stepId="basics" editAriaLabel="Editar nome da categoria">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-foreground border border-border/50">
              <CategoryIcon name={resolvedIcon} className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-muted-foreground block font-medium">
                {isSubcategory
                  ? `Subcategoria • ${parentCategory?.name}`
                  : "Categoria"}
              </span>
              <span className="font-semibold text-foreground truncate block text-sm">
                {data.name || "Sem nome"}
              </span>
            </div>
          </div>
        </WizardReviewRow>

        {/* Linha 2: Aparência Visual (Cor e Ícone) */}
        <WizardReviewRow
          stepId="color"
          editAriaLabel="Editar aparência visual"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground block font-medium">
              Aparência Visual
            </span>
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  backgroundColor: `${resolvedColor}20`,
                  borderColor: `${resolvedColor}45`,
                  color: resolvedColor,
                }}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border"
              >
                <CategoryIcon name={resolvedIcon} className="size-3.5" />
              </div>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                Cor:{" "}
                <strong className="font-semibold text-foreground/90">
                  {data.color ? resolvedColor : `${resolvedColor} (Padrão)`}
                </strong>
              </span>
            </div>
          </div>
        </WizardReviewRow>
      </WizardReviewCard>

      <WizardReviewHint>
        {isSubcategory
          ? "A subcategoria ficará disponível para detalhar lançamentos e orçamentos."
          : "A categoria ficará disponível para organização de lançamentos e orçamentos."}
      </WizardReviewHint>
    </div>
  );
}

export function createCategoryReviewStep(
  parentCategory?: CategoryParentSummary | null,
  submitText?: string
): WizardStep<CategoryFormValues> {
  const defaultSubmit = parentCategory
    ? "Criar subcategoria"
    : "Criar categoria";

  const BoundReviewComponent = (
    props: CustomStepProps<CategoryFormValues>
  ) => <CategoryReviewContent {...props} parentCategory={parentCategory} />;

  return {
    id: "review",
    title: "Revisão Final",
    submitText: submitText ?? defaultSubmit,
    component: BoundReviewComponent,
  };
}

export const categoryReviewStep: WizardStep<CategoryFormValues> =
  createCategoryReviewStep();

