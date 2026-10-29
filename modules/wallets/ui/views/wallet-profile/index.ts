import { AdaptiveConfig } from "@/types/adaptive.types";
import { WalletProfileInput } from "./types";
import WalletProfileViewDesktop from "./desktop";
import { useWalletProfileDesktop } from "./desktop/hook";
import WalletProfileViewMobile from "./mobile";
import { useWalletProfileMobile } from "./mobile/hook";

export const WalletProfileAdaptiveConfig: AdaptiveConfig<WalletProfileInput> = {
    views: {
        mobile: {
            hook: useWalletProfileMobile,
            View: WalletProfileViewMobile,
        },
        desktop: {
            hook: useWalletProfileDesktop,
            View: WalletProfileViewDesktop,
        },
    },
};

export * from "./types";
export { default as WalletProfileViewDesktop } from "./desktop";
export { default as WalletProfileViewMobile } from "./mobile";
