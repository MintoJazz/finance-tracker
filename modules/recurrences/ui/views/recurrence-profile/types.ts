import type { DateRange } from "react-day-picker";
import type { FilterBadgeOption } from "@/components/filter-badges-carousel";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import type {
    MacroHorizonInfo,
    RecurrenceCycleFilters,
    RecurrenceCyclesResult,
} from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";
import type { RecurrenceProfile } from "@/modules/recurrences/models/schemas/recurrence-profile.schema";
import type { RecurrenceCycleActionContext } from "@/modules/recurrences/ui/components/recurrence-cycle-table/actions";
import type { RecurrenceCycleFilterBadgeKey } from "@/modules/recurrences/ui/hooks/use-recurrence-cycle-filters";

export interface RecurrenceProfileInput {
    balanceId: number;
    profile?: RecurrenceProfile | null;
    initialCyclesData?: RecurrenceCyclesResult | null;
}

export interface RecurrenceProfileDesktopProps {
    profile: RecurrenceProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    horizon: MacroHorizonInfo;
    cycles: CycleItem[];
    isLoadingCycles: boolean;
    cyclesError: string | null;
    filters: RecurrenceCycleFilters;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<RecurrenceCycleFilterBadgeKey>[];
    dateRange?: DateRange;
    applyFilters: (updates: Partial<RecurrenceCycleFilters>) => void;
    onSelectDateRange: (range: DateRange | undefined) => void;
    onResetDateRange: () => void;
    onNavigateOffset: (targetOffset: number) => void;
    onPrevHorizon: (horizon: MacroHorizonInfo) => void;
    onNextHorizon: (horizon: MacroHorizonInfo) => void;
    clearFilters: () => void;
    isVisible: boolean;
    setIsVisible: (val: boolean | ((v: boolean) => boolean)) => void;
    actionContext: RecurrenceCycleActionContext;
    onEditRecurrence?: () => void;
    onToggleActiveRecurrence?: () => void;
    onOpenRecurrenceActions?: () => void;
}

export interface RecurrenceProfileMobileProps {
    profile: RecurrenceProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
    horizon: MacroHorizonInfo;
    cycles: CycleItem[];
    isLoadingCycles: boolean;
    cyclesError: string | null;
    filters: RecurrenceCycleFilters;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<RecurrenceCycleFilterBadgeKey>[];
    dateRange?: DateRange;
    applyFilters: (updates: Partial<RecurrenceCycleFilters>) => void;
    onSelectDateRange: (range: DateRange | undefined) => void;
    onResetDateRange: () => void;
    onNavigateOffset: (targetOffset: number) => void;
    onPrevHorizon: (horizon: MacroHorizonInfo) => void;
    onNextHorizon: (horizon: MacroHorizonInfo) => void;
    clearFilters: () => void;
    isVisible: boolean;
    setIsVisible: (val: boolean | ((v: boolean) => boolean)) => void;
    actionContext: RecurrenceCycleActionContext;
    isFilterDrawerOpen: boolean;
    setIsFilterDrawerOpen: (open: boolean) => void;
    isRecurrenceActionsOpen: boolean;
    setIsRecurrenceActionsOpen: (open: boolean) => void;
    onEditRecurrence?: () => void;
    onToggleActiveRecurrence?: () => void;
    onOpenRecurrenceActions?: () => void;
    onSelectCycle?: (cycle: CycleItem) => void;
}
