import { Page } from "@/types/pagination.types";
import {
    ContractCycleFilters,
    ContractCycleItem,
} from "../../../core/schemas/contract-cycle.schema";
import { ContractProfile } from "../../../core/schemas/contract-profile.schema";
import { ContractActionContext } from "../../components/contract-actions-drawer/actions";
import { ContractCycleActionContext } from "../../components/contract-profile/contract-cycle-actions";
import { ArchiveRestoreModalContext } from "@/hooks/use-archive-restore";

export interface ContractProfileContractModalContextItem {
    isOpen: boolean;
    onClose: () => void;
}

export interface ContractProfileContractModalsContext {
    rename: ContractProfileContractModalContextItem;
    schedule: ContractProfileContractModalContextItem;
    limits: ContractProfileContractModalContextItem;
}

export interface ContractProfileInput {
    contractId: string | number;
    profile?: ContractProfile | null;
    initialCycles?: Page<ContractCycleItem> | null;
}

export interface ContractProfileDesktopProps {
    profile: ContractProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    contractActionsContext: ContractActionContext;
    archiveContext: ArchiveRestoreModalContext;
    restoreContext: ArchiveRestoreModalContext;
    cyclesData: Page<ContractCycleItem> | null;
    isLoadingCycles: boolean;
    cyclesError: string | null;
    reloadCycles: () => Promise<void>;
    filters: ContractCycleFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<ContractCycleFilters>) => void;
    clearFilters: () => void;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
    cycleActionContext: ContractCycleActionContext;
    contractModalsContext?: ContractProfileContractModalsContext;
    onCycleClick?: (cycle: ContractCycleItem) => void;
}

export interface ContractProfileMobileProps {
    profile: ContractProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    contractActionsContext: ContractActionContext;
    archiveContext: ArchiveRestoreModalContext;
    restoreContext: ArchiveRestoreModalContext;
    items: ContractCycleItem[];
    total: number;
    hasMore: boolean;
    isLoadingCycles: boolean;
    isLoadingMore: boolean;
    cyclesError: string | null;
    reloadCycles: () => Promise<void>;
    loadMore: () => Promise<void>;
    sentinelRef: (node: HTMLDivElement | null) => void;
    filters: ContractCycleFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<ContractCycleFilters>) => void;
    clearFilters: () => void;
    isFilterDrawerOpen: boolean;
    setIsFilterDrawerOpen: (open: boolean) => void;
    cycleActionContext: ContractCycleActionContext;
    onCycleClick?: (cycle: ContractCycleItem) => void;
}
