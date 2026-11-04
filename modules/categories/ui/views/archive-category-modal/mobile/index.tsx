"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Archive, Loader2 } from "lucide-react";
import type { ArchiveCategoryModalProps } from "../types";

export default function ArchiveCategoryModalViewMobile({
  isOpen,
  entityName,
  categoryName,
  itemName,
  isSubcategory,
  isSubmitting,
  onConfirm,
  onClose,
  onOpenChangeComplete,
}: ArchiveCategoryModalProps) {
  const name = categoryName ?? entityName ?? itemName ?? "";
  const title = isSubcategory ? "Arquivar subcategoria" : "Arquivar categoria";

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
            <Archive className="size-6" />
          </div>
          <DrawerTitle className="text-center">{title}</DrawerTitle>
          <DrawerDescription className="text-center">
            {isSubcategory ? (
              <>
                Tem certeza de que deseja arquivar a subcategoria{" "}
                <strong className="font-medium text-foreground">{name}</strong>?
                Ela deixará de aparecer nas listagens ativas, mas o histórico de
                lançamentos será preservado.
              </>
            ) : (
              <>
                Tem certeza de que deseja arquivar a categoria{" "}
                <strong className="font-medium text-foreground">{name}</strong>?
                Ela e todas as suas subcategorias ativas deixarão de aparecer nas
                listagens ativas, mas o histórico de lançamentos será preservado.
              </>
            )}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-4">
          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="w-full"
          >
            {isSubmitting && (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            )}
            {isSubmitting ? "Arquivando..." : "Sim, arquivar"}
          </Button>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full"
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

