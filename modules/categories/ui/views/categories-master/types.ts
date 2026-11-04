import type { DateRange } from "react-day-picker";
import type { CategoryItem, CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";
import type { ArchiveCategoryModalProps } from "@/modules/categories/ui/views/archive-category-modal/types";

export interface CategoriesMasterCommonProps {
  data: CategoryTreeDTO;
  items: CategoryItem[];
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  sentinelRef: (node: HTMLDivElement | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  onChangeDateRange: (range: DateRange | undefined) => void;
  activeId: number | null;
  activeParentId?: number | null;
  loadingChildrenIds: number[];
  onFetchChildren: (categoryId: number) => Promise<void>;
  onOpenAddModal: () => void;
  actionContext: CategoryActionContext;
  archiveContext: ArchiveCategoryModalProps;
}

export type CategoriesMasterDesktopProps = CategoriesMasterCommonProps;

export interface CategoriesMasterMobileProps extends CategoriesMasterCommonProps {
  activeCategoryForActions: CategoryItem | null;
  isActionsDrawerOpen: boolean;
  onOpenActions: (category: CategoryItem) => void;
  onCloseActions: () => void;
  onCloseMaster: () => void;
}
