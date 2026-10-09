import { AdaptiveConfig } from "@/components/adaptive";
import RestoreContractModalViewDesktop from "./desktop";
import RestoreContractModalViewMobile from "./mobile";
import type { ArchiveRestoreModalContext } from "@/hooks/use-archive-restore";

export const RestoreContractModalConfig: AdaptiveConfig<
    ArchiveRestoreModalContext,
    ArchiveRestoreModalContext
> = {
    views: {
        mobile: {
            hook: (input: ArchiveRestoreModalContext) => input,
            View: RestoreContractModalViewMobile,
        },
        desktop: {
            hook: (input: ArchiveRestoreModalContext) => input,
            View: RestoreContractModalViewDesktop,
        },
    },
};

export { RestoreContractModalViewDesktop, RestoreContractModalViewMobile };
