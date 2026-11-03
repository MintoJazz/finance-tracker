"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMasterDetail } from "@/components/master-detail";
import type {
  CategoryItem,
  CategoryTreeDTO,
} from "@/modules/categories/models/category.schema";
import type { CategoriesMasterMobileProps } from "../types";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";
import { useCategoriesMasterList } from "../hooks/use-categories-master-list";

export function useMobileCategoriesMaster(
  data: CategoryTreeDTO
): CategoriesMasterMobileProps {
  const router = useRouter();
  const { closeMaster } = useMasterDetail();
  const listProps = useCategoriesMasterList(data);

  const [activeCategoryForActions, setActiveCategoryForActions] =
    React.useState<CategoryItem | null>(null);
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = React.useState(false);

  const onOpenAddModal = React.useCallback(() => {
    router.push("/categories/create");
  }, [router]);

  const actionContext = React.useMemo<CategoryActionContext>(
    () => ({
      onAddSubcategory: (cat: CategoryItem) => {
        setIsActionsDrawerOpen(false);
        router.push(`/categories/create?parentId=${cat.id}`);
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
    [router]
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
    onOpenAddModal,
    actionContext,
    activeCategoryForActions,
    isActionsDrawerOpen,
    onOpenActions: handleOpenActions,
    onCloseActions: handleCloseActions,
    onCloseMaster: closeMaster,
  };
}
