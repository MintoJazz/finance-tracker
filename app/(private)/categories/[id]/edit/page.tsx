import { notFound, redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";
import { ViewContainer } from "@/components/adaptive";
import { EditCategoryModalConfig } from "@/modules/categories/ui/views/edit-category-modal";
import { getDeviceViewport } from "@/lib/device";
import type { CategoryParentSummary } from "@/modules/categories/ui/components/category-form/types";
import CategoryDetailPage from "../page";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    from?: string;
    to?: string;
    tab?: string;
  }>;
}

export default async function EditCategoryPage(props: Props) {
  const session = await SessionHandler.getSession();
  const params = await props.params;

  if (!session) redirect("/login");

  const { id } = params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId) || categoryId <= 0) {
    notFound();
  }

  const basicInfoUseCase = CategoryFactory.makeGetCategoryBasicInfoUseCase();
  const result = await basicInfoUseCase.execute({
    session,
    id: categoryId,
  });

  if (!result.success || !result.data || !result.data.id) {
    notFound();
  }

  const category = result.data;
  let parentCategory: CategoryParentSummary | null = null;

  if (category.parentId) {
    const parentResult = await basicInfoUseCase.execute({
      session,
      id: category.parentId,
    });
    if (parentResult.success && parentResult.data && parentResult.data.id) {
      parentCategory = {
        id: parentResult.data.id,
        name: parentResult.data.name,
        icon: parentResult.data.appearance?.icon ?? parentResult.data.icon ?? null,
        color: parentResult.data.appearance?.color ?? parentResult.data.color ?? null,
      };
    }
  }

  const initialViewport = await getDeviceViewport();

  return (
    <>
      <CategoryDetailPage params={props.params} searchParams={props.searchParams} />
      <ViewContainer
        initialViewport={initialViewport}
        data={{
          id: categoryId,
          parentCategory,
          defaultValues: {
            name: category.name,
            color: category.appearance?.color ?? category.color ?? null,
            icon: category.appearance?.icon ?? category.icon ?? null,
            parentId: category.parentId ?? null,
          },
        }}
        {...EditCategoryModalConfig}
      />
    </>
  );
}
