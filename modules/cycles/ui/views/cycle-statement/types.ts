import { Page } from "@/types/pagination.types";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { CycleDetail } from "@/modules/cycles/models/cycle-detail.schema";
import {
    MovementEntry,
    MovementEntryFilters,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { RowAction } from "@/components/data-table";

export interface CycleStatementInput<TContext = unknown> {
    balanceId: number;
    range: CycleRange;
    scope: MovementEntryScope; // "CARD" | "CONTRACT_CYCLE" | "WALLET"
    initialDetail?: CycleDetail | null;
    initialMovements?: Page<MovementEntry> | null;
    onNavigateCycle?: (range: CycleRange) => void;
    onOpenFilters?: () => void; // Disparo para a viewport pai abrir o drawer no mobile!
    rowActions?: RowAction<MovementEntry, TContext>[];
    actionContext?: TContext;
    onSelectEntry?: (entry: MovementEntry) => void;
}

export interface CycleStatementDesktopProps<TContext = unknown> {
    cycleDetail: CycleDetail | null;
    isLoadingDetail: boolean;
    detailError: string | null;
    movementsData: Page<MovementEntry> | null;
    isLoadingMovements: boolean;
    movementsError: string | null;
    filters: MovementEntryFilters;
    activeFilterCount: number;
    applyFilters: (newFilters: Partial<MovementEntryFilters>) => void;
    clearFilters: () => void;
    onNavigate: (range: CycleRange) => void;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
    scope: MovementEntryScope;
    rowActions?: RowAction<MovementEntry, TContext>[];
    actionContext?: TContext;
}

export interface CycleStatementMobileProps {
    cycleDetail: CycleDetail | null;
    isLoadingDetail: boolean;
    detailError: string | null;
    items: MovementEntry[];
    total: number;
    hasMore: boolean;
    isLoadingMovements: boolean;
    isLoadingMore: boolean;
    movementsError: string | null;
    filters: MovementEntryFilters;
    activeFilterCount: number;
    applyFilters: (newFilters: Partial<MovementEntryFilters>) => void;
    clearFilters: () => void;
    onNavigate: (range: CycleRange) => void;
    onOpenFilters?: () => void; // Repassado para o botão de filtros da toolbar mobile
    sentinelRef?: (node: HTMLDivElement | null) => void;
    scope: MovementEntryScope;
    onSelectEntry?: (entry: MovementEntry) => void;
}

