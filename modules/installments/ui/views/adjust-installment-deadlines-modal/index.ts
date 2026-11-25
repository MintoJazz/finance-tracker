import type { AdaptiveConfig } from "@/types/adaptive.types";
import AdjustInstallmentDeadlinesModalViewDesktop from "./desktop";
import { useAdjustInstallmentDeadlinesModal } from "./hook";
import AdjustInstallmentDeadlinesModalViewMobile from "./mobile";
import type {
    AdjustInstallmentDeadlinesModalInput,
    AdjustInstallmentDeadlinesModalProps,
} from "./types";

export const AdjustInstallmentDeadlinesModalConfig: AdaptiveConfig<
    AdjustInstallmentDeadlinesModalInput,
    AdjustInstallmentDeadlinesModalProps
> = {
    views: {
        mobile: {
            hook: useAdjustInstallmentDeadlinesModal,
            View: AdjustInstallmentDeadlinesModalViewMobile,
        },
        desktop: {
            hook: useAdjustInstallmentDeadlinesModal,
            View: AdjustInstallmentDeadlinesModalViewDesktop,
        },
    },
};

export { useAdjustInstallmentDeadlinesModal } from "./hook";
export * from "./types";
