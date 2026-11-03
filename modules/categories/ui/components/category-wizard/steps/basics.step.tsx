import * as React from "react";
import z from "zod";
import { Input } from "@/components/ui/input";
import type { WizardStep } from "@/components/wizard";
import {
  CategoryFormSchema,
  type CategoryFormValues,
} from "@/modules/categories/models/category.schema";
import type { CategoryParentSummary } from "../../category-form/types";

export const categoryBasicsStepSchema = z.object({
  name: CategoryFormSchema.shape.name,
});

export function createCategoryBasicsStep(
  parentCategory?: CategoryParentSummary | null
): WizardStep<CategoryFormValues> {
  const isSubcategory = Boolean(parentCategory);

  return {
    id: "basics",
    title: isSubcategory ? "Nome da Subcategoria" : "Nome da Categoria",
    schema: categoryBasicsStepSchema,
    fields: [
      {
        name: "name",
        label: "Nome de identificação",
        description: isSubcategory
          ? `Subcategoria vinculada a ${parentCategory?.name}. Ex: Mercado, Restaurantes...`
          : "Ex: Alimentação, Moradia, Transporte, Investimentos...",
        children: (
          <Input
            placeholder={
              isSubcategory
                ? "Digite o nome da subcategoria"
                : "Digite o nome da categoria"
            }
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            className="h-9 text-sm"
          />
        ),
      },
    ],
  };
}

export const categoryBasicsStep: WizardStep<CategoryFormValues> =
  createCategoryBasicsStep();
