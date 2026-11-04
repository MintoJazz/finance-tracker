"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/toast";
import type {
  ArchivedCategoryGroup,
  ArchivedSubcategory,
  RestoreRequest,
} from "./types";
import { getArchivedCategoriesAction } from "@/modules/categories/ui/actions/get-archived-categories.action";
import { restoreCategoryAction } from "@/modules/categories/ui/actions/restore-category.action";
import { restoreSubcategoryAction } from "@/modules/categories/ui/actions/restore-subcategory.action";

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
    async (request: RestoreRequest) => {
      try {
        if (onRestore) {
          onRestore(request);
          return;
        }

        if (request.kind === "category") {
          const result = await restoreCategoryAction({ id: request.categoryId });
          if (!result.success) {
            toast.add({
              type: "error",
              title: "Erro ao restaurar categoria",
              description: result.error ?? "Não foi possível restaurar a categoria.",
            });
            return;
          }
          toast.add({
            type: "success",
            title: "Categoria restaurada",
            description: `A categoria "${result.data?.name}" foi restaurada com sucesso.`,
          });
          await fetchCategories();
        } else {
          const result = await restoreSubcategoryAction({ id: request.subcategoryId });
          if (!result.success) {
            toast.add({
              type: "error",
              title: "Erro ao restaurar subcategoria",
              description: result.error ?? "Não foi possível restaurar a subcategoria.",
            });
            return;
          }
          toast.add({
            type: "success",
            title: "Subcategoria restaurada",
            description: `A subcategoria "${result.data?.name}" foi restaurada com sucesso.`,
          });
          await fetchCategories();
        }
      } catch (err) {
        console.error("[ArchivedCategories] Erro ao restaurar:", err);
        toast.add({
          type: "error",
          title: "Erro inesperado",
          description: "Ocorreu um erro ao tentar restaurar.",
        });
      }
    },
    [onRestore, fetchCategories]
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
