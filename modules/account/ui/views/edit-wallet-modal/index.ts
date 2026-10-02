import { AdaptiveConfig } from "@/types/adaptive.types";
import { EditWalletModalInput, EditWalletModalProps } from "./types";
import { useEditWalletModal } from "./hook";
import EditWalletModalViewDesktop from "./desktop";
import EditWalletModalViewMobile from "./mobile";

export const EditWalletModalConfig: AdaptiveConfig<EditWalletModalInput, EditWalletModalProps> = {
    views: {
        mobile: {
            hook: useEditWalletModal,
            View: EditWalletModalViewMobile,
        },
        desktop: {
            hook: useEditWalletModal,
            View: EditWalletModalViewDesktop,
        },
    },
};

export { useEditWalletModal } from "./hook";
export * from "./types";
