"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import {
  type CategoryItem,
  type CategoryTreeDTO,
  findCategoryInTree,
} from "@/modules/categories/models/category.schema";
import type { CategoriesMasterDesktopProps } from "../types";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";
import { archiveCategoryAction } from "@/modules/categories/ui/actions/archive-category.action";
import { archiveSubcategoryAction } from "@/modules/categories/ui/actions/archive-subcategory.action";
import { useCategoriesMasterList } from "../hooks/use-categories-master-list";

export function useDesktopCategoriesMaster(
  data: CategoryTreeDTO
): CategoriesMasterDesktopProps {
  const router = useRouter();
  const listProps = useCategoriesMasterList(data);

  const [targetCategory, setTargetCategory] = React.useState<CategoryItem | null>(null);

  const { archiveContext: baseArchiveContext, onArchive: triggerArchive } =
    useArchiveRestore<CategoryItem>({
      find: (target) => {
        if (targetCategory && targetCategory.id === target.id) {
          return targetCategory;
        }
        return findCategoryInTree(listProps.items, target.id) ?? undefined;
      },
      entityName: "Categoria",
      onArchiveConfirm: async (category) => {
        if (category.parentId === null) {
          const result = await archiveCategoryAction({ id: category.id });
          if (!result.success) throw new Error(result.error);
        } else {
          const result = await archiveSubcategoryAction({ id: category.id });
          if (!result.success) throw new Error(result.error);
        }
        router.refresh();
      },
    });

  const onArchive = React.useCallback(
    (cat: CategoryItem) => {
      setTargetCategory(cat);
      triggerArchive(cat);
    },
    [triggerArchive]
  );

  const onOpenAddModal = React.useCallback(() => {
    router.push("/categories/create");
  }, [router]);

  const actionContext = React.useMemo<CategoryActionContext>(
    () => ({
      onAddSubcategory: (cat: CategoryItem) => {
        router.push(`/categories/create?parentId=${cat.id}`);
      },
      onEdit: (cat: CategoryItem) => {
        router.push(`/categories/${cat.id}/edit`);
      },
      onArchive,
    }),
    [router, onArchive]
  );

  const archiveContext = React.useMemo(
    () => ({
      ...baseArchiveContext,
      categoryName: targetCategory?.name ?? baseArchiveContext.itemName,
      isSubcategory: Boolean(targetCategory && targetCategory.parentId !== null),
      onClose: () => {
        baseArchiveContext.onClose();
        setTargetCategory(null);
      },
    }),
    [baseArchiveContext, targetCategory]
  );

  return {
    data,
    ...listProps,
    onOpenAddModal,
    actionContext,
    archiveContext,
  };
}
