import type { AdaptiveConfig } from "@/types/adaptive.types";
import ChangeInstallmentCategoryModalViewDesktop from "./desktop";
import { useChangeInstallmentCategoryModal } from "./hook";
import ChangeInstallmentCategoryModalViewMobile from "./mobile";
import type {
    ChangeInstallmentCategoryModalInput,
    ChangeInstallmentCategoryModalProps,
} from "./types";

export const ChangeInstallmentCategoryModalConfig: AdaptiveConfig<
    ChangeInstallmentCategoryModalInput,
    ChangeInstallmentCategoryModalProps
> = {
    views: {
        mobile: {
            hook: useChangeInstallmentCategoryModal,
            View: ChangeInstallmentCategoryModalViewMobile,
        },
        desktop: {
            hook: useChangeInstallmentCategoryModal,
            View: ChangeInstallmentCategoryModalViewDesktop,
        },
    },
};

export { useChangeInstallmentCategoryModal } from "./hook";
export * from "./types";
