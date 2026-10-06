import { AdaptiveConfig } from "@/types/adaptive.types";
import { ArchiveCardModalInput, ArchiveCardModalProps } from "./types";
import { useArchiveCardModal } from "./hook";
import ArchiveCardModalViewDesktop from "./desktop";
import ArchiveCardModalViewMobile from "./mobile";

export const ArchiveCardModalConfig: AdaptiveConfig<
    ArchiveCardModalInput,
    ArchiveCardModalProps
> = {
    views: {
        mobile: {
            hook: useArchiveCardModal,
            View: ArchiveCardModalViewMobile,
        },
        desktop: {
            hook: useArchiveCardModal,
            View: ArchiveCardModalViewDesktop,
        },
    },
};

export { ArchiveCardModalViewDesktop, ArchiveCardModalViewMobile };
export { useArchiveCardModal } from "./hook";
export * from "./types";