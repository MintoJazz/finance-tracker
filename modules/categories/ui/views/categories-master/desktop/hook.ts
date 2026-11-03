"use client";

import * as React from "react";
import type { CategoryItem, CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import type { CategoriesMasterDesktopProps } from "../types";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";
import { useCategoriesMasterList } from "../hooks/use-categories-master-list";

export function useDesktopCategoriesMaster(
  data: CategoryTreeDTO
): CategoriesMasterDesktopProps {
  const listProps = useCategoriesMasterList(data);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const actionContext = React.useMemo<CategoryActionContext>(
    () => ({
      onAddSubcategory: (cat: CategoryItem) => {
        console.log("[Desktop] Nova subcategoria para:", cat.name);
        setIsAddModalOpen(true);
      },
      onEdit: (cat: CategoryItem) => {
        console.log("[Desktop] Editar categoria:", cat.name);
      },
      onArchive: (cat: CategoryItem) => {
        console.log("[Desktop] Arquivar categoria:", cat.name);
      },
    }),
    []
  );

  return {
    data,
    ...listProps,
    isAddModalOpen,
    onOpenAddModal: () => setIsAddModalOpen(true),
    onCloseAddModal: () => setIsAddModalOpen(false),
    actionContext,
  };
}
