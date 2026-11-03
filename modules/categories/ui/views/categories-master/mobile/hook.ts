"use client";

import * as React from "react";
import { useMasterDetail } from "@/components/master-detail";
import type { CategoryItem, CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import type { CategoriesMasterMobileProps } from "../types";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";
import { useCategoriesMasterList } from "../hooks/use-categories-master-list";

export function useMobileCategoriesMaster(
  data: CategoryTreeDTO
): CategoriesMasterMobileProps {
  const { closeMaster } = useMasterDetail();
  const listProps = useCategoriesMasterList(data);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [activeCategoryForActions, setActiveCategoryForActions] =
    React.useState<CategoryItem | null>(null);
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = React.useState(false);

  const actionContext = React.useMemo<CategoryActionContext>(
    () => ({
      onAddSubcategory: (cat: CategoryItem) => {
        console.log("[Mobile] Nova subcategoria para:", cat.name);
        setIsActionsDrawerOpen(false);
        setIsAddModalOpen(true);
      },
      onEdit: (cat: CategoryItem) => {
        console.log("[Mobile] Editar categoria:", cat.name);
        setIsActionsDrawerOpen(false);
      },
      onArchive: (cat: CategoryItem) => {
        console.log("[Mobile] Arquivar categoria:", cat.name);
        setIsActionsDrawerOpen(false);
      },
    }),
    []
  );

  const handleOpenActions = (category: CategoryItem) => {
    setActiveCategoryForActions(category);
    setIsActionsDrawerOpen(true);
  };

  const handleCloseActions = () => {
    setIsActionsDrawerOpen(false);
    setActiveCategoryForActions(null);
  };

  return {
    data,
    ...listProps,
    isAddModalOpen,
    onOpenAddModal: () => setIsAddModalOpen(true),
    onCloseAddModal: () => setIsAddModalOpen(false),
    actionContext,
    activeCategoryForActions,
    isActionsDrawerOpen,
    onOpenActions: handleOpenActions,
    onCloseActions: handleCloseActions,
    onCloseMaster: closeMaster,
  };
}
