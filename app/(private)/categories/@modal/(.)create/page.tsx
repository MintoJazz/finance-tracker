import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getCategoryBasicInfoAction } from "@/modules/categories/ui/actions/get-category-basic-info.action";
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
      const result = await getCategoryBasicInfoAction({ id: parsedId });

      // Subcategoria só pode ser vinculada a uma categoria raiz (parentId === null)
      if (result.success && result.data && result.data.parentId === null && result.data.id) {
        parentCategory = {
          id: result.data.id,
          name: result.data.name,
          icon: result.data.appearance?.icon ?? result.data.icon ?? null,
          color:
            result.data.appearance?.color ?? result.data.color ?? null,
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
