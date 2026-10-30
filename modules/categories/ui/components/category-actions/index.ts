import { RowAction, RowLike } from "@/types/actions.types";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { Archive, FolderPlus, PencilLine } from "lucide-react";

export interface CategoryActionContext {
  onAddSubcategory?: (category: CategoryItem) => void;
  onEdit?: (category: CategoryItem) => void;
  onArchive?: (category: CategoryItem) => void;
}

function getOriginal(row: RowLike<CategoryItem> | CategoryItem): CategoryItem {
  return "original" in row ? row.original : row;
}

export const CATEGORY_ACTIONS: RowAction<CategoryItem, CategoryActionContext>[] = [
  {
    id: "add-subcategory",
    label: "Nova subcategoria",
    icon: FolderPlus,
    onClick: (row, context) => context?.onAddSubcategory?.(getOriginal(row)),
    hidden: (row) => row.original.parentId !== null
  },
  {
    id: "edit",
    label: "Editar",
    icon: PencilLine,
    onClick: (row, context) => context?.onEdit?.(getOriginal(row)),
  },
  {
    id: "archive",
    label: "Arquivar",
    icon: Archive,
    variant: "destructive",
    separatorBefore: true,
    onClick: (row, context) => context?.onArchive?.(getOriginal(row)),
  },
];
