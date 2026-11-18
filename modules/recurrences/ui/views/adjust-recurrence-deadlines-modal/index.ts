import type { AdaptiveConfig } from "@/types/adaptive.types";
import type {
    AdjustRecurrenceDeadlinesModalInput,
    AdjustRecurrenceDeadlinesModalProps,
} from "./types";
import { useAdjustRecurrenceDeadlinesModal } from "./hook";
import AdjustRecurrenceDeadlinesModalViewDesktop from "./desktop";
import AdjustRecurrenceDeadlinesModalViewMobile from "./mobile";

export const AdjustRecurrenceDeadlinesModalConfig: AdaptiveConfig<
    AdjustRecurrenceDeadlinesModalInput,
    AdjustRecurrenceDeadlinesModalProps
> = {
    views: {
        mobile: {
            hook: useAdjustRecurrenceDeadlinesModal,
            View: AdjustRecurrenceDeadlinesModalViewMobile,
        },
        desktop: {
            hook: useAdjustRecurrenceDeadlinesModal,
            View: AdjustRecurrenceDeadlinesModalViewDesktop,
        },
    },
};

export { useAdjustRecurrenceDeadlinesModal } from "./hook";
export * from "./types";
