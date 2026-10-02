import { AdaptiveConfig } from "@/types/adaptive.types";
import { CreateWalletModalInput, CreateWalletModalProps } from "./types";
import { useCreateWalletModal } from "./hook";
import CreateWalletModalViewDesktop from "./desktop";
import CreateWalletModalViewMobile from "./mobile";

export const CreateWalletModalConfig: AdaptiveConfig<CreateWalletModalInput, CreateWalletModalProps> = {
    views: {
        mobile: {
            hook: useCreateWalletModal,
            View: CreateWalletModalViewMobile,
        },
        desktop: {
            hook: useCreateWalletModal,
            View: CreateWalletModalViewDesktop,
        },
    },
};

export { useCreateWalletModal } from "./hook";
export * from "./types";
