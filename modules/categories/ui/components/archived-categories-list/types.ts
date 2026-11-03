import type {
  ArchivedSubcategory,
  ArchivedCategoryGroup,
} from "@/modules/categories/models/category.schema";

export type { ArchivedSubcategory, ArchivedCategoryGroup };

export type RestoreRequest =
  | { kind: "category"; categoryId: number }
  | { kind: "subcategory-active-parent"; categoryId: number; subcategoryId: number }
  | { kind: "subcategory-archived-parent"; categoryId: number; subcategoryId: number };

export interface ArchivedCategoriesListProps {
  initialItems?: ArchivedCategoryGroup[];
  onRestore?: (request: RestoreRequest) => void;
  className?: string;
}
