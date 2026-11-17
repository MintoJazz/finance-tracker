import type { AdaptiveConfig } from "@/types/adaptive.types";
import type { RecurrenceProfileInput } from "./types";
import RecurrenceProfileViewDesktop from "./desktop";
import { useRecurrenceProfileDesktop } from "./desktop/hook";
import RecurrenceProfileViewMobile from "./mobile";
import { useRecurrenceProfileMobile } from "./mobile/hook";

export const RecurrenceProfileAdaptiveConfig: AdaptiveConfig<RecurrenceProfileInput> = {
    views: {
        mobile: {
            hook: useRecurrenceProfileMobile,
            View: RecurrenceProfileViewMobile,
        },
        desktop: {
            hook: useRecurrenceProfileDesktop,
            View: RecurrenceProfileViewDesktop,
        },
    },
};

export * from "./types";
export { default as RecurrenceProfileViewDesktop } from "./desktop";
export { default as RecurrenceProfileViewMobile } from "./mobile";
