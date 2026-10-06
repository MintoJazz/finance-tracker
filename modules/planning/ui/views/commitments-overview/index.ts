import { AdaptiveConfig } from "@/types/adaptive.types";
import { CommitmentsOverviewInput } from "./types";
import CommitmentsOverviewViewDesktop from "./desktop";
import { useCommitmentsOverviewDesktop } from "./desktop/hook";
import CommitmentsOverviewViewMobile from "./mobile";
import { useCommitmentsOverviewMobile } from "./mobile/hook";

export const CommitmentsOverviewAdaptiveConfig: AdaptiveConfig<CommitmentsOverviewInput> =
    {
        views: {
            mobile: {
                hook: useCommitmentsOverviewMobile,
                View: CommitmentsOverviewViewMobile,
            },
            desktop: {
                hook: useCommitmentsOverviewDesktop,
                View: CommitmentsOverviewViewDesktop,
            },
        },
    };

export * from "./types";
export { default as CommitmentsOverviewViewDesktop } from "./desktop";
export { default as CommitmentsOverviewViewMobile } from "./mobile";