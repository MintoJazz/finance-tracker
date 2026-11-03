"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ArchivedCategoryGroup,
  ArchivedSubcategory,
  RestoreRequest,
} from "./types";
import { getArchivedCategoriesAction } from "@/modules/categories/ui/actions/get-archived-categories.action";

interface UseArchivedCategoriesListParams {
  initialItems?: ArchivedCategoryGroup[];
  onRestore?: (request: RestoreRequest) => void;
}

export function useArchivedCategoriesList({
  initialItems,
  onRestore,
}: UseArchivedCategoriesListParams = {}) {
  const [items, setItems] = useState<ArchivedCategoryGroup[]>(initialItems ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialItems);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getArchivedCategoriesAction();

      if (!result.success || !result.data) {
        setError(result.error ?? "Não foi possível carregar as categorias arquivadas.");
      } else {
        setItems(result.data);
      }
    } catch (err) {
      console.error("[useArchivedCategoriesList] Erro inesperado ao buscar categorias:", err);
      setError("Ocorreu um erro inesperado ao carregar as categorias arquivadas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialItems) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchCategories();
    }
  }, [fetchCategories, initialItems]);

  const dispatchRestore = useCallback(
    (request: RestoreRequest) => {
      // TODO: Na próxima entrega, este handler abrirá o dialog de confirmação correspondente
      console.info("[ArchivedCategories] Solicitação de restauração recebida:", request);
      onRestore?.(request);
    },
    [onRestore]
  );

  const handleRestoreCategory = useCallback(
    (group: ArchivedCategoryGroup) => {
      dispatchRestore({
        kind: "category",
        categoryId: group.id,
      });
    },
    [dispatchRestore]
  );

  const handleRestoreSubcategory = useCallback(
    (group: ArchivedCategoryGroup, subcategory: ArchivedSubcategory) => {
      if (group.archived) {
        dispatchRestore({
          kind: "subcategory-archived-parent",
          categoryId: group.id,
          subcategoryId: subcategory.id,
        });
      } else {
        dispatchRestore({
          kind: "subcategory-active-parent",
          categoryId: group.id,
          subcategoryId: subcategory.id,
        });
      }
    },
    [dispatchRestore]
  );

  return {
    items,
    isLoading,
    error,
    reload: fetchCategories,
    handleRestoreCategory,
    handleRestoreSubcategory,
  };
}
