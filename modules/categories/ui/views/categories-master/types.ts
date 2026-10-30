import type { DateRange } from "react-day-picker";
import type { CategoryItem, CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";

export interface CategoriesMasterCommonProps {
  data: CategoryTreeDTO;
  dateRange: DateRange;
  onChangeDateRange: (range: DateRange | undefined) => void;
  activeId: number | null;
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  actionContext: CategoryActionContext;
}

export type CategoriesMasterDesktopProps = CategoriesMasterCommonProps;

export interface CategoriesMasterMobileProps extends CategoriesMasterCommonProps {
  activeCategoryForActions: CategoryItem | null;
  isActionsDrawerOpen: boolean;
  onOpenActions: (category: CategoryItem) => void;
  onCloseActions: () => void;
  onCloseMaster: () => void;
}
