import type { Page, PageRequest } from "@/types/pagination.types";
import type { CategoryItem } from "@/modules/categories/models/category.schema";

export interface CategoryDetailFoundDTO {
  id: number;
  name: string;
  parentId: number | null;
  icon?: string | null;
  color?: string | null;
  parentName?: string | null;
  childrenCount: number;
}

export interface ICategoryQueries {
  listRootCategories(
    contextId: number,
    pageRequest: PageRequest,
    filter?: { search?: string }
  ): Promise<Page<CategoryItem>>;

  listCategoryChildren(
    contextId: number,
    parentId: number
  ): Promise<CategoryItem[]>;

  findCategoryById(
    contextId: number,
    categoryId: number
  ): Promise<CategoryDetailFoundDTO | null>;
}

