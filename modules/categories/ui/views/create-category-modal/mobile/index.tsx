"use client";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import type { CreateCategoryModalProps } from "../types";
import { CategoryWizard } from "../../../components/category-wizard";

export default function CreateCategoryModalViewMobile({
  isOpen,
  parentCategory,
  form,
  onSubmit,
  onClose,
  onOpenChangeComplete,
}: CreateCategoryModalProps) {
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
          {isSubcategory ? "Nova subcategoria" : "Nova categoria"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          {isSubcategory
            ? `Detalhe suas movimentações dentro de "${parentCategory?.name}".`
            : "Agrupe suas movimentações por assunto."}
        </DrawerDescription>
        <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
          <CategoryWizard
            initialData={form.getValues()}
            parentCategory={parentCategory}
            onSubmit={onSubmit}
            onClose={onClose}
            submitText={
              isSubcategory ? "Criar subcategoria" : "Criar categoria"
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
