import CategoriesPage from "../page";
import CreateCategoryModalPage from "../@modal/(.)create/page";

interface CreateCategoryDirectPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    tab?: string;
    parentId?: string;
    categoryId?: string;
  }>;
}

export default async function CreateCategoryDirectPage(
  props: CreateCategoryDirectPageProps
) {
  return (
    <>
      <CategoriesPage searchParams={props.searchParams} />
      <CreateCategoryModalPage searchParams={props.searchParams} />
    </>
  );
}

