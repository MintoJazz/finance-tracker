import type { AdaptiveConfig } from "@/types/adaptive.types";
import EditInstallmentModalViewDesktop from "./desktop";
import { useEditInstallmentModal } from "./hook";
import EditInstallmentModalViewMobile from "./mobile";
import type {
    EditInstallmentModalInput,
    EditInstallmentModalProps,
} from "./types";

export const EditInstallmentModalConfig: AdaptiveConfig<
    EditInstallmentModalInput,
    EditInstallmentModalProps
> = {
    views: {
        mobile: {
            hook: useEditInstallmentModal,
            View: EditInstallmentModalViewMobile,
        },
        desktop: {
            hook: useEditInstallmentModal,
            View: EditInstallmentModalViewDesktop,
        },
    },
};

export { useEditInstallmentModal } from "./hook";
export * from "./types";
