import type {
  CategoryItem,
  CategoryEntity,
  ArchiveCategoryResult,
  ArchiveSubcategoryResult,
  RestoreCategoryResult,
  RestoreSubcategoryResult,
  UpdateCategoryInput,
} from "@/modules/categories/models/category.schema";

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

  update(
    contextId: number,
    data: UpdateCategoryInput
  ): Promise<CategoryItem>;

  findParentCategory(
    contextId: number,
    parentId: number
  ): Promise<{ id: number; parentId: number | null; removedAt: Date | null } | null>;

  findByIdAndContextId(
    id: number,
    contextId: number
  ): Promise<CategoryEntity | null>;

  archiveCategory(
    id: number,
    contextId: number
  ): Promise<ArchiveCategoryResult>;

  archiveSubcategory(
    id: number,
    contextId: number
  ): Promise<ArchiveSubcategoryResult>;

  restoreCategory(
    id: number,
    contextId: number
  ): Promise<RestoreCategoryResult>;

  restoreSubcategory(
    id: number,
    contextId: number
  ): Promise<RestoreSubcategoryResult>;
}
