"use client";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import type { EditCategoryModalProps } from "../types";
import { CategoryWizard } from "../../../components/category-wizard";

export default function EditCategoryModalViewMobile({
  isOpen,
  parentCategory,
  form,
  onSubmit,
  onClose,
  onOpenChangeComplete,
}: EditCategoryModalProps) {
  const isSubcategory = Boolean(parentCategory);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle
    >
      <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
        <DrawerTitle className="sr-only">
          {isSubcategory ? "Editar subcategoria" : "Editar categoria"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          {isSubcategory
            ? `Altere as informações da subcategoria vinculada a "${parentCategory?.name}".`
            : "Altere o nome, cor ou ícone da categoria."}
        </DrawerDescription>
        <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
          <CategoryWizard
            initialData={form.getValues()}
            parentCategory={parentCategory}
            onSubmit={onSubmit}
            onClose={onClose}
            submitText="Salvar alterações"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

