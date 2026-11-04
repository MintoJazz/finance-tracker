"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Archive, Loader2 } from "lucide-react";
import type { ArchiveCategoryModalProps } from "../types";

export default function ArchiveCategoryModalViewDesktop({
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
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <Archive className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
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
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting && (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            )}
            {isSubmitting ? "Arquivando..." : "Sim, arquivar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

