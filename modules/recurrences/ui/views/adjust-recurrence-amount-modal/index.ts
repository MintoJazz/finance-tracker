import type { AdaptiveConfig } from "@/types/adaptive.types";
import type {
    AdjustRecurrenceAmountModalInput,
    AdjustRecurrenceAmountModalProps,
} from "./types";
import { useAdjustRecurrenceAmountModal } from "./hook";
import AdjustRecurrenceAmountModalViewDesktop from "./desktop";
import AdjustRecurrenceAmountModalViewMobile from "./mobile";

export const AdjustRecurrenceAmountModalConfig: AdaptiveConfig<
    AdjustRecurrenceAmountModalInput,
    AdjustRecurrenceAmountModalProps
> = {
    views: {
        mobile: {
            hook: useAdjustRecurrenceAmountModal,
            View: AdjustRecurrenceAmountModalViewMobile,
        },
        desktop: {
            hook: useAdjustRecurrenceAmountModal,
            View: AdjustRecurrenceAmountModalViewDesktop,
        },
    },
};

export { useAdjustRecurrenceAmountModal } from "./hook";
export * from "./types";
