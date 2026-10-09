import { AdaptiveConfig } from "@/components/adaptive";
import ArchiveContractModalViewDesktop from "./desktop";
import ArchiveContractModalViewMobile from "./mobile";
import type { ArchiveRestoreModalContext } from "@/hooks/use-archive-restore";

export const ArchiveContractModalConfig: AdaptiveConfig<
    ArchiveRestoreModalContext,
    ArchiveRestoreModalContext
> = {
    views: {
        mobile: {
            hook: (input: ArchiveRestoreModalContext) => input,
            View: ArchiveContractModalViewMobile,
        },
        desktop: {
            hook: (input: ArchiveRestoreModalContext) => input,
            View: ArchiveContractModalViewDesktop,
        },
    },
};

export { ArchiveContractModalViewDesktop, ArchiveContractModalViewMobile };
