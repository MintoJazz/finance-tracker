import type { AdaptiveConfig } from "@/types/adaptive.types";
import ChangeInstallmentCardModalViewDesktop from "./desktop";
import { useChangeInstallmentCardModal } from "./hook";
import ChangeInstallmentCardModalViewMobile from "./mobile";
import type {
    ChangeInstallmentCardModalInput,
    ChangeInstallmentCardModalProps,
} from "./types";

export const ChangeInstallmentCardModalConfig: AdaptiveConfig<
    ChangeInstallmentCardModalInput,
    ChangeInstallmentCardModalProps
> = {
    views: {
        mobile: {
            hook: useChangeInstallmentCardModal,
            View: ChangeInstallmentCardModalViewMobile,
        },
        desktop: {
            hook: useChangeInstallmentCardModal,
            View: ChangeInstallmentCardModalViewDesktop,
        },
    },
};

export { useChangeInstallmentCardModal } from "./hook";
export * from "./types";
