import { Page } from "@/types/pagination.types";
import { WalletProfile } from "@/modules/account/core/schemas/wallet-profile.schema";
import { WalletMovement, WalletMovementFilters } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { ArchiveWalletModalProps } from "../archive-wallet-modal/types";
import { RestoreWalletModalProps } from "../restore-wallet-modal/types";
import { WalletActionContext } from "../../components/wallet-actions-drawer";
import { MovementActionContext } from "@/modules/ledger/ui/components/wallet-movements-actions-menu";

export interface WalletProfileInput {
    walletId: number;
    profile?: WalletProfile | null;
    initialMovements?: Page<WalletMovement> | null;
}

export interface WalletProfileDesktopProps {
    profile: WalletProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    walletActionsContext: WalletActionContext;
    archiveContext: ArchiveWalletModalProps;
    restoreContext: RestoreWalletModalProps;
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

export interface WalletProfileMobileProps {
    profile: WalletProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    walletActionsContext: WalletActionContext;
    archiveContext: ArchiveWalletModalProps;
    restoreContext: RestoreWalletModalProps;
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