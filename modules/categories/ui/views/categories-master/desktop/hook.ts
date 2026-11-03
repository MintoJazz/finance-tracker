"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type {
  CategoryItem,
  CategoryTreeDTO,
} from "@/modules/categories/models/category.schema";
import type { CategoriesMasterDesktopProps } from "../types";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";
import { useCategoriesMasterList } from "../hooks/use-categories-master-list";

export function useDesktopCategoriesMaster(
  data: CategoryTreeDTO
): CategoriesMasterDesktopProps {
  const router = useRouter();
  const listProps = useCategoriesMasterList(data);

  const onOpenAddModal = React.useCallback(() => {
    router.push("/categories/create");
  }, [router]);

  const actionContext = React.useMemo<CategoryActionContext>(
    () => ({
      onAddSubcategory: (cat: CategoryItem) => {
        router.push(`/categories/create?parentId=${cat.id}`);
      },
      onEdit: (cat: CategoryItem) => {
        console.log("[Desktop] Editar categoria:", cat.name);
      },
      onArchive: (cat: CategoryItem) => {
        console.log("[Desktop] Arquivar categoria:", cat.name);
      },
    }),
    [router]
  );

  return {
    data,
    ...listProps,
    onOpenAddModal,
    actionContext,
  };
}
