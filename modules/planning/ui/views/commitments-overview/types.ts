import { Page } from "@/types/pagination.types";
import {
    CommitmentCycleFilters,
    CommitmentCycleItem,
    CommitmentsPeriodSummary,
} from "../../../core/schemas/commitment-cycle.schema";
import { CommitmentCycleActionContext } from "../../components/commitment-cycle-actions-drawer";

export interface CommitmentsOverviewInput {
    contextId?: number;
    title?: string;
    initialSummary?: CommitmentsPeriodSummary | null;
    initialCycles?: Page<CommitmentCycleItem> | null;
}

export interface CommitmentsOverviewDesktopProps {
    title: string;
    summary: CommitmentsPeriodSummary | null;
    isLoadingSummary: boolean;
    summaryError: string | null;
    cyclesData: Page<CommitmentCycleItem> | null;
    isLoadingCycles: boolean;
    cyclesError: string | null;
    actionContext: CommitmentCycleActionContext;
    filters: CommitmentCycleFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<CommitmentCycleFilters>) => void;
    clearFilters: () => void;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
}

export interface CommitmentsOverviewMobileProps {
    title: string;
    summary: CommitmentsPeriodSummary | null;
    isLoadingSummary: boolean;
    summaryError: string | null;
    items: CommitmentCycleItem[];
    total: number;
    hasMore: boolean;
    isLoadingCycles: boolean;
    isLoadingMore: boolean;
    cyclesError: string | null;
    sentinelRef: (node: HTMLDivElement | null) => void;
    actionContext: CommitmentCycleActionContext;
    filters: CommitmentCycleFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<CommitmentCycleFilters>) => void;
    clearFilters: () => void;
    isFilterDrawerOpen: boolean;
    setIsFilterDrawerOpen: (open: boolean) => void;
}