import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";
import type { CategoryParentSummary } from "@/modules/categories/ui/components/category-form/types";
import { CreateCategoryModalConfig } from "@/modules/categories/ui/views/create-category-modal";

export interface CreateCategoryModalPageProps {
  searchParams?: Promise<{
    parentId?: string;
    categoryId?: string;
  }>;
}

export default async function CreateCategoryModalPage(
  props: CreateCategoryModalPageProps
) {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const rawParentId = searchParams?.parentId ?? searchParams?.categoryId;

  let parentCategory: CategoryParentSummary | null = null;

  if (rawParentId) {
    const parsedId = Number(rawParentId);
    if (Number.isInteger(parsedId) && parsedId > 0) {
      const found = CategoriesMockService.findCategoryById(parsedId);
      // Subcategoria só pode ser vinculada a uma categoria raiz
      if (found && !found.category.parentId) {
        parentCategory = {
          id: found.category.id,
          name: found.category.name,
          icon: found.category.appearance?.icon ?? found.category.icon ?? null,
          color:
            found.category.appearance?.color ?? found.category.color ?? null,
        };
      }
    }
  }

  const initialViewport = await getDeviceViewport();

  return (
    <ViewContainer
      key={parentCategory ? `sub-${parentCategory.id}` : "root"}
      initialViewport={initialViewport}
      data={{ parentCategory }}
      {...CreateCategoryModalConfig}
    />
  );
}

