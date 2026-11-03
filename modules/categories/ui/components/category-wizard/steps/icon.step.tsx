"use client";

import * as React from "react";
import z from "zod";
import { useWizard, type WizardStep } from "@/components/wizard";
import {
  CategoryFormSchema,
  type CategoryFormValues,
} from "@/modules/categories/models/category.schema";
import { CategoryIconPicker } from "../../category-icon-picker";
import type { CategoryParentSummary } from "../../category-form/types";

export const categoryIconStepSchema = z.object({
  icon: CategoryFormSchema.shape.icon,
});

function WizardIconPickerField({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (val: string | null) => void;
}) {
  const { data } = useWizard<CategoryFormValues>();

  return (
    <CategoryIconPicker
      value={value}
      onChange={onChange}
      activeColor={data.color}
      variant="carousel"
      showLabel={false}
    />
  );
}

export function createCategoryIconStep(
  parentCategory?: CategoryParentSummary | null
): WizardStep<CategoryFormValues> {
  const isSubcategory = Boolean(parentCategory);

  return {
    id: "icon",
    title: isSubcategory ? "Ícone da Subcategoria" : "Ícone da Categoria",
    schema: categoryIconStepSchema,
    fields: [
      {
        name: "icon",
        label: "Escolha um ícone",
        description: "Opcional. Deslize para explorar ou busque pelo nome.",
        children: (_ctx, field) => (
          <WizardIconPickerField
            value={field.value}
            onChange={(icon) => field.onChange(icon)}
          />
        ),
      },
    ],
  };
}

export const categoryIconStep: WizardStep<CategoryFormValues> =
  createCategoryIconStep();

