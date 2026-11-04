"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { archiveCategoryAction } from "@/modules/categories/ui/actions/archive-category.action";
import { archiveSubcategoryAction } from "@/modules/categories/ui/actions/archive-subcategory.action";
import type {
  ArchiveCategoryModalInput,
  ArchiveCategoryModalProps,
} from "./types";

export function useArchiveCategoryModal(
  input: ArchiveCategoryModalInput
): ArchiveCategoryModalProps {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasClosedRef = useRef(false);

  const clearQueryParams = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("archive");
    params.delete("delete");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [router, pathname, searchParams]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      clearQueryParams();
    }, 300);
  }, [clearQueryParams]);

  const onOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open) {
        clearQueryParams();
      }
    },
    [clearQueryParams]
  );

  const isSubcategory = input.parentId !== null && input.parentId !== undefined;

  const onConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (isSubcategory) {
        const result = await archiveSubcategoryAction({ id: input.id });
        if (!result.success) {
          setIsSubmitting(false);
          toast.add({
            type: "error",
            title: "Erro ao arquivar",
            description:
              result.error ??
              "Não foi possível arquivar a subcategoria. Tente novamente.",
            priority: "high",
          });
          return;
        }

        toast.add({
          type: "success",
          title: "Subcategoria arquivada",
          description: `A subcategoria "${input.name}" foi arquivada com sucesso.`,
        });
      } else {
        const result = await archiveCategoryAction({ id: input.id });
        if (!result.success) {
          setIsSubmitting(false);
          toast.add({
            type: "error",
            title: "Erro ao arquivar",
            description:
              result.error ??
              "Não foi possível arquivar a categoria. Tente novamente.",
            priority: "high",
          });
          return;
        }

        toast.add({
          type: "success",
          title: "Categoria arquivada",
          description: `A categoria "${input.name}" foi arquivada com sucesso.`,
        });
      }

      onClose();
    } catch (error) {
      setIsSubmitting(false);
      console.error("[useArchiveCategoryModal] Erro ao arquivar:", error);
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro interno. Tente novamente mais tarde.",
        priority: "high",
      });
    }
  };

  return {
    isOpen,
    entityName: input.name,
    categoryName: input.name,
    itemName: input.name,
    isSubcategory,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
  };
}

