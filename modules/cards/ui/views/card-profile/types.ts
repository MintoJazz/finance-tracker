import { Page } from "@/types/pagination.types";
import { CardProfile } from "@/modules/cards/models/card-profile.schema";
import { CycleDetail } from "@/modules/cycles/models/cycle-detail.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import {
    MovementEntry,
    MovementEntryFilters,
} from "@/modules/movements/models/movement-entry.schema";
import { ArchiveCardModalProps } from "../archive-card-modal/types";
import { RestoreCardModalProps } from "../restore-card-modal/types";
import { CardActionContext } from "@/modules/cards/ui/components/card-actions-drawer";
import {
    CycleStatementDesktopProps,
    CycleStatementMobileProps,
} from "@/modules/cycles/ui/views/cycle-statement/types";

export interface CardProfileInput {
    cardId: number;
    profile?: CardProfile | null;
    initialDetail?: CycleDetail | null;
    initialMovements?: Page<MovementEntry> | null;
    range?: CycleRange;
}

export interface CardProfileDesktopProps {
    profile: CardProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    cardActionsContext: CardActionContext;
    archiveContext: ArchiveCardModalProps;
    restoreContext: RestoreCardModalProps;
    statementProps: CycleStatementDesktopProps;
}

export interface CardProfileMobileProps {
    profile: CardProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    cardActionsContext: CardActionContext;
    archiveContext: ArchiveCardModalProps;
    restoreContext: RestoreCardModalProps;
    statementProps: CycleStatementMobileProps;
    isFilterDrawerOpen: boolean;
    setIsFilterDrawerOpen: (open: boolean) => void;
    filters: MovementEntryFilters;
    applyFilters: (newFilters: Partial<MovementEntryFilters>) => void;
    clearFilters: () => void;
}
