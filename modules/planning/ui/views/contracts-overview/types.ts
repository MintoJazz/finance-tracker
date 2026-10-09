import { Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts } from "../../../core/schemas/contract.schema";
import { ContractActionContext } from "../../components/contract-actions-drawer";
import { ArchiveRestoreModalContext } from "@/hooks/use-archive-restore";

export interface FilterContext {
  searchProps: { value: string; onValueChange: (val: string) => void };
  showArchived: { pressed: boolean; onPressedChange: (val: boolean) => void };
  typeProps: { value: string; onValueChange: (val: string) => void };
}

export interface PaginationContext {
  setPage: (val: number) => void;
  setPageSize: (val: number) => void;
}

export interface ContractsOverviewProps {
  data: Page<ContractSummaryItem>;
  counts: ContractTypeCounts;
  actionsMenuContext: ContractActionContext;
  onAddClick: () => void;
  filterContext: FilterContext;
  paginationContext: PaginationContext;
  archiveContext: ArchiveRestoreModalContext;
  restoreContext: ArchiveRestoreModalContext;
}

export interface MobileContractsOverviewProps {
  items: ContractSummaryItem[];
  counts: ContractTypeCounts;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
  actionsMenuContext: ContractActionContext;
  onAddClick: () => void;
  filterContext: FilterContext;
  archiveContext: ArchiveRestoreModalContext;
  restoreContext: ArchiveRestoreModalContext;
}
