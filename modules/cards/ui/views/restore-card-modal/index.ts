import { AdaptiveConfig } from "@/types/adaptive.types";
import { RestoreCardModalInput, RestoreCardModalProps } from "./types";
import { useRestoreCardModal } from "./hook";
import RestoreCardModalViewDesktop from "./desktop";
import RestoreCardModalViewMobile from "./mobile";

export const RestoreCardModalConfig: AdaptiveConfig<
    RestoreCardModalInput,
    RestoreCardModalProps
> = {
    views: {
        mobile: {
            hook: useRestoreCardModal,
            View: RestoreCardModalViewMobile,
        },
        desktop: {
            hook: useRestoreCardModal,
            View: RestoreCardModalViewDesktop,
        },
    },
};

export { RestoreCardModalViewDesktop, RestoreCardModalViewMobile };
export { useRestoreCardModal } from "./hook";
export * from "./types";