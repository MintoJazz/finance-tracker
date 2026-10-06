import { AdaptiveConfig } from "@/types/adaptive.types";
import { RestoreWalletModalInput, RestoreWalletModalProps } from "./types";
import { useRestoreWalletModal } from "./hook";
import RestoreWalletModalViewDesktop from "./desktop";
import RestoreWalletModalViewMobile from "./mobile";

export const RestoreWalletModalConfig: AdaptiveConfig<RestoreWalletModalInput, RestoreWalletModalProps> = {
    views: {
        mobile: {
            hook: useRestoreWalletModal,
            View: RestoreWalletModalViewMobile,
        },
        desktop: {
            hook: useRestoreWalletModal,
            View: RestoreWalletModalViewDesktop,
        },
    },
};

export { RestoreWalletModalViewDesktop, RestoreWalletModalViewMobile };
export { useRestoreWalletModal } from "./hook";
export * from "./types";
