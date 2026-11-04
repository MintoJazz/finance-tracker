"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { EditCategoryModalProps } from "../types";
import { CategoryForm } from "../../../components/category-form";

export default function EditCategoryModalViewDesktop({
  isOpen,
  isSubmitting,
  parentCategory,
  form,
  onSubmit,
  onClose,
  onOpenChangeComplete,
}: EditCategoryModalProps) {
  const isSubcategory = Boolean(parentCategory);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent className="sm:max-w-160 p-5 gap-5">
        <DialogHeader className="border-b border-border/60 -mx-5 px-5 pb-4 gap-1">
          <DialogTitle className="text-base font-semibold">
            {isSubcategory ? "Editar subcategoria" : "Editar categoria"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isSubcategory
              ? `Altere as informações da subcategoria vinculada a "${parentCategory?.name}".`
              : "Altere o nome, cor ou ícone da categoria."}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          form={form}
          parentCategory={parentCategory}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Salvar alterações"
          submitLoadingText="Salvando..."
        />
      </DialogContent>
    </Dialog>
  );
}

