import type { AdaptiveConfig } from "@/types/adaptive.types";
import AdjustInstallmentValuesModalViewDesktop from "./desktop";
import { useAdjustInstallmentValuesModal } from "./hook";
import AdjustInstallmentValuesModalViewMobile from "./mobile";
import type {
    AdjustInstallmentValuesModalInput,
    AdjustInstallmentValuesModalProps,
} from "./types";

export const AdjustInstallmentValuesModalConfig: AdaptiveConfig<
    AdjustInstallmentValuesModalInput,
    AdjustInstallmentValuesModalProps
> = {
    views: {
        mobile: {
            hook: useAdjustInstallmentValuesModal,
            View: AdjustInstallmentValuesModalViewMobile,
        },
        desktop: {
            hook: useAdjustInstallmentValuesModal,
            View: AdjustInstallmentValuesModalViewDesktop,
        },
    },
};

export { useAdjustInstallmentValuesModal } from "./hook";
export * from "./types";
