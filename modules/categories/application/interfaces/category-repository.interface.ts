import type { CategoryItem } from "@/modules/categories/models/category.schema";

export interface CreateCategoryRepositoryDTO {
  name: string;
  parentId?: number | null;
  icon?: string | null;
  color?: string | null;
}

export interface ICategoryRepository {
  create(
    contextId: number,
    data: CreateCategoryRepositoryDTO
  ): Promise<CategoryItem>;

  findParentCategory(
    contextId: number,
    parentId: number
  ): Promise<{ id: number; parentId: number | null } | null>;
}

