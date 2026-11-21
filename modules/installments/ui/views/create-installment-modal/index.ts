import type { AdaptiveConfig } from "@/types/adaptive.types";
import type {
    CreateInstallmentModalInput,
    CreateInstallmentModalProps,
} from "./types";
import { useCreateInstallmentModal } from "./hook";
import CreateInstallmentModalViewDesktop from "./desktop";
import CreateInstallmentModalViewMobile from "./mobile";

export const CreateInstallmentModalConfig: AdaptiveConfig<
    CreateInstallmentModalInput,
    CreateInstallmentModalProps
> = {
    views: {
        mobile: {
            hook: useCreateInstallmentModal,
            View: CreateInstallmentModalViewMobile,
        },
        desktop: {
            hook: useCreateInstallmentModal,
            View: CreateInstallmentModalViewDesktop,
        },
    },
};

export { useCreateInstallmentModal } from "./hook";
export * from "./types";
