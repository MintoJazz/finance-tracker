import { AdaptiveConfig } from "@/types/adaptive.types";
import { CardProfileInput } from "./types";
import CardProfileViewDesktop from "./desktop";
import { useCardProfileDesktop } from "./desktop/hook";
import CardProfileViewMobile from "./mobile";
import { useCardProfileMobile } from "./mobile/hook";

export const CardProfileAdaptiveConfig: AdaptiveConfig<CardProfileInput> = {
    views: {
        mobile: {
            hook: useCardProfileMobile,
            View: CardProfileViewMobile,
        },
        desktop: {
            hook: useCardProfileDesktop,
            View: CardProfileViewDesktop,
        },
    },
};

export * from "./types";
export { default as CardProfileViewDesktop } from "./desktop";
export { default as CardProfileViewMobile } from "./mobile";