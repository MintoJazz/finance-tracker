"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CreateCategoryModalProps } from "../types";
import { CategoryForm } from "../../../components/category-form";

export default function CreateCategoryModalViewDesktop({
  isOpen,
  isSubmitting,
  parentCategory,
  form,
  onSubmit,
  onClose,
  onOpenChangeComplete,
}: CreateCategoryModalProps) {
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
            {isSubcategory ? "Nova subcategoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isSubcategory
              ? `Detalhe suas movimentações dentro de "${parentCategory?.name}".`
              : "Agrupe suas movimentações por assunto."}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          form={form}
          parentCategory={parentCategory}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText={isSubcategory ? "Criar subcategoria" : "Criar categoria"}
          submitLoadingText="Criando..."
        />
      </DialogContent>
    </Dialog>
  );
}
