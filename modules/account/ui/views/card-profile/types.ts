import { Page } from "@/types/pagination.types";
import {
    CardCycleOption,
    CardProfile,
} from "@/modules/account/core/schemas/card-profile.schema";
import { ArchiveCardModalProps } from "../archive-card-modal/types";
import { RestoreCardModalProps } from "../restore-card-modal/types";
import { CardActionContext } from "@/modules/account/ui/components/card-actions-drawer";
import {
    WalletMovement,
    WalletMovementFilters,
} from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementActionContext } from "@/modules/ledger/ui/components/wallet-movements-actions-menu";

export interface CardProfileInput {
    cardId: number;
    profile?: CardProfile | null;
    initialMovements?: Page<WalletMovement> | null;
}

export interface CardCycleNavigationContext {
    activeCycle: CardCycleOption | null;
    hasPrevCycle: boolean;
    hasNextCycle: boolean;
    onPrevCycle: () => void;
    onNextCycle: () => void;
}

export interface CardProfileDesktopProps {
    profile: CardProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    cardActionsContext: CardActionContext;
    archiveContext: ArchiveCardModalProps;
    restoreContext: RestoreCardModalProps;
    cycleNavigation: CardCycleNavigationContext;
    movementsData: Page<WalletMovement> | null;
    isLoadingMovements: boolean;
    movementsError: string | null;
    reloadMovements: () => Promise<void>;
    movementActionContext: MovementActionContext;
    filters: WalletMovementFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<WalletMovementFilters>) => void;
    clearFilters: () => void;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
}

export interface CardProfileMobileProps {
    profile: CardProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    cardActionsContext: CardActionContext;
    archiveContext: ArchiveCardModalProps;
    restoreContext: RestoreCardModalProps;
    cycleNavigation: CardCycleNavigationContext;
    items: WalletMovement[];
    total: number;
    hasMore: boolean;
    isLoadingMovements: boolean;
    isLoadingMore: boolean;
    movementsError: string | null;
    reloadMovements: () => Promise<void>;
    loadMore: () => Promise<void>;
    sentinelRef: (node: HTMLDivElement | null) => void;
    movementActionContext: MovementActionContext;
    filters: WalletMovementFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<WalletMovementFilters>) => void;
    clearFilters: () => void;
    isFilterDrawerOpen: boolean;
    setIsFilterDrawerOpen: (open: boolean) => void;
}