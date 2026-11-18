import type { AdaptiveConfig } from "@/types/adaptive.types";
import type { AdjustCardLimitModalInput, AdjustCardLimitModalProps } from "./types";
import { useAdjustCardLimitModal } from "./hook";
import AdjustCardLimitModalViewDesktop from "./desktop";
import AdjustCardLimitModalViewMobile from "./mobile";

export const AdjustCardLimitModalConfig: AdaptiveConfig<
    AdjustCardLimitModalInput,
    AdjustCardLimitModalProps
> = {
    views: {
        mobile: { hook: useAdjustCardLimitModal, View: AdjustCardLimitModalViewMobile },
        desktop: { hook: useAdjustCardLimitModal, View: AdjustCardLimitModalViewDesktop },
    },
};

export { useAdjustCardLimitModal } from "./hook";
export * from "./types";
