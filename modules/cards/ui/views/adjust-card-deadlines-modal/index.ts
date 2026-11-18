import type { AdaptiveConfig } from "@/types/adaptive.types";
import type {
    AdjustCardDeadlinesModalInput,
    AdjustCardDeadlinesModalProps,
} from "./types";
import { useAdjustCardDeadlinesModal } from "./hook";
import AdjustCardDeadlinesModalViewDesktop from "./desktop";
import AdjustCardDeadlinesModalViewMobile from "./mobile";

export const AdjustCardDeadlinesModalConfig: AdaptiveConfig<
    AdjustCardDeadlinesModalInput,
    AdjustCardDeadlinesModalProps
> = {
    views: {
        mobile: { hook: useAdjustCardDeadlinesModal, View: AdjustCardDeadlinesModalViewMobile },
        desktop: { hook: useAdjustCardDeadlinesModal, View: AdjustCardDeadlinesModalViewDesktop },
    },
};

export { useAdjustCardDeadlinesModal } from "./hook";
export * from "./types";
