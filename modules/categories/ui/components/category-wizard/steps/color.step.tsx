import * as React from "react";
import z from "zod";
import type { WizardStep } from "@/components/wizard";
import {
  CategoryFormSchema,
  type CategoryFormValues,
} from "@/modules/categories/models/category.schema";
import { CategoryColorPicker } from "../../category-color-picker";

export const categoryColorStepSchema = z.object({
  color: CategoryFormSchema.shape.color,
});

export const categoryColorStep: WizardStep<CategoryFormValues> = {
  id: "color",
  title: "Cor de Identificação",
  schema: categoryColorStepSchema,
  fields: [
    {
      name: "color",
      label: "Escolha uma cor",
      description:
        "Opcional. Deslize para explorar e selecione uma cor, ou toque novamente para desmarcar.",
      children: (_ctx, field) => (
        <CategoryColorPicker
          value={field.value}
          onChange={(color) => field.onChange(color)}
          variant="carousel"
        />
      ),
    },
  ],
};

