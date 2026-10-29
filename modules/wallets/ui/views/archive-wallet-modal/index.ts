import { AdaptiveConfig } from "@/types/adaptive.types";
import { ArchiveWalletModalInput, ArchiveWalletModalProps } from "./types";
import { useArchiveWalletModal } from "./hook";
import ArchiveWalletModalViewDesktop from "./desktop";
import ArchiveWalletModalViewMobile from "./mobile";

export const ArchiveWalletModalConfig: AdaptiveConfig<ArchiveWalletModalInput, ArchiveWalletModalProps> = {
    views: {
        mobile: {
            hook: useArchiveWalletModal,
            View: ArchiveWalletModalViewMobile,
        },
        desktop: {
            hook: useArchiveWalletModal,
            View: ArchiveWalletModalViewDesktop,
        },
    },
};

export { ArchiveWalletModalViewDesktop, ArchiveWalletModalViewMobile };
export { useArchiveWalletModal } from "./hook";
export * from "./types";
