"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { ControlledField, FormRoot } from "@/components/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import { CategoryPreviewCard } from "./preview-card";
import {
  categoryColorField,
  categoryIconField,
  categoryNameField,
} from "./fields";
import type { CategoryFormContext, CategoryFormProps } from "./types";

export function CategoryForm({
  form,
  onSubmit,
  onCancel,
  parentCategory,
  isSubmitting = false,
  submitText,
  submitLoadingText = "Salvando...",
}: CategoryFormProps) {
  const resolvedSubmitText =
    submitText ??
    (parentCategory ? "Criar subcategoria" : "Criar categoria");

  const context = React.useMemo<CategoryFormContext>(
    () => ({ parentCategory }),
    [parentCategory]
  );

  return (
    <FormRoot
      id="category-form"
      form={form}
      onSubmit={onSubmit}
      className="gap-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-[216px_1fr] gap-5 items-stretch">
        {/* Coluna Esquerda: Card de Preview ao vivo + Input de Nome */}
        <div className="flex flex-col gap-3.5 justify-between">
          <CategoryPreviewCard parentCategory={parentCategory} />
          <ControlledField<CategoryFormValues, CategoryFormContext>
            {...categoryNameField}
            context={context}
          />
        </div>

        {/* Coluna Direita: Seletor de Cor + Seletor de Ícone */}
        <div className="flex flex-col gap-4 justify-between min-w-0">
          <ControlledField<CategoryFormValues, CategoryFormContext>
            {...categoryColorField}
            context={context}
          />
          <ControlledField<CategoryFormValues, CategoryFormContext>
            {...categoryIconField}
            context={context}
          />
        </div>
      </div>

      <DialogFooter className="bg-transparent border-t border-border/60 pt-3.5 pb-3.5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" form="category-form" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          )}
          {isSubmitting ? submitLoadingText : resolvedSubmitText}
        </Button>
      </DialogFooter>
    </FormRoot>
  );
}

export * from "./fields";
export * from "./preview-card";
export * from "./types";

