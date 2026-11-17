import type { DateRange } from "react-day-picker";
import type { MacroHorizonInfo } from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

export interface RecurrenceCycleNavigatorBaseProps {
    horizon: MacroHorizonInfo;
    onPrev: () => void;
    onNext: () => void;
    isLoading?: boolean;
    dateRange?: DateRange;
    onSelectDateRange: (range: DateRange | undefined) => void;
    onResetDateRange: () => void;
    className?: string;
}

export type RecurrenceCycleNavigatorDesktopProps = RecurrenceCycleNavigatorBaseProps;

export interface RecurrenceCycleNavigatorMobileProps
    extends RecurrenceCycleNavigatorBaseProps {
    onOpenFilters?: () => void;
    activeFilterCount?: number;
}
