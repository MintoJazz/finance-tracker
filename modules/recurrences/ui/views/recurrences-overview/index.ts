import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import type { AdaptiveConfig } from "@/types/adaptive.types";
import RecurrencesOverviewViewDesktop from "./desktop";
import { useRecurrenceOverview } from "./desktop/hook";
import RecurrencesOverviewViewMobile from "./mobile";
import { useMobileRecurrenceOverview } from "./mobile/hook";

export const RecurrencesOverviewConfig: AdaptiveConfig<RecurrenceListItem[]> = {
    views: {
        mobile: {
            hook: useMobileRecurrenceOverview,
            View: RecurrencesOverviewViewMobile,
        },
        desktop: {
            hook: useRecurrenceOverview,
            View: RecurrencesOverviewViewDesktop,
        },
    },
};

