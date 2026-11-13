import { Page } from "@/types/pagination.types";
import { WalletProfile } from "@/modules/wallets/models/wallet-profile.schema";
import { WalletMovementFilters } from "@/modules/movements/models/wallet-movement.schema";
import { MovementEntry } from "@/modules/movements/models/movement-entry.schema";
import { ArchiveWalletModalProps } from "../archive-wallet-modal/types";
import { RestoreWalletModalProps } from "../restore-wallet-modal/types";
import { WalletActionContext } from "../../components/wallet-actions-drawer";
import { MovementEntryActionContext } from "@/modules/movements/ui/components/movement-entry/movement-entry-actions-drawer";

export interface WalletProfileInput {
    walletId: number;
    profile?: WalletProfile | null;
    initialMovements?: Page<MovementEntry> | null;
}

export interface WalletProfileDesktopProps {
    profile: WalletProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    walletActionsContext: WalletActionContext;
    archiveContext: ArchiveWalletModalProps;
    restoreContext: RestoreWalletModalProps;
    movementsData: Page<MovementEntry> | null;
    isLoadingMovements: boolean;
    movementsError: string | null;
    reloadMovements: () => Promise<void>;
    movementActionContext: MovementEntryActionContext;
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
    items: MovementEntry[];
    total: number;
    hasMore: boolean;
    isLoadingMovements: boolean;
    isLoadingMore: boolean;
    movementsError: string | null;
    reloadMovements: () => Promise<void>;
    loadMore: () => Promise<void>;
    sentinelRef: (node: HTMLDivElement | null) => void;
    movementActionContext: MovementEntryActionContext;
    filters: WalletMovementFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<WalletMovementFilters>) => void;
    clearFilters: () => void;
    isFilterDrawerOpen: boolean;
    setIsFilterDrawerOpen: (open: boolean) => void;
}
