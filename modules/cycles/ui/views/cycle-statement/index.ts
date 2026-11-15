import { AdaptiveConfig } from "@/components/adaptive";
import { CycleStatementInput } from "./types";
import { CycleStatementDesktopView } from "./desktop";
import { useCycleStatementDesktop } from "./desktop/hook";
import { CycleStatementMobileView } from "./mobile";
import { useCycleStatementMobile } from "./mobile/hook";

export const CycleStatementAdaptiveConfig: AdaptiveConfig<CycleStatementInput<any>> = {
    views: {
        mobile: {
            hook: useCycleStatementMobile,
            View: CycleStatementMobileView,
        },
        desktop: {
            hook: useCycleStatementDesktop,
            View: CycleStatementDesktopView,
        },
    },
};

export { CycleStatementDesktopView } from "./desktop";
export { useCycleStatementDesktop } from "./desktop/hook";
export { CycleStatementMobileView } from "./mobile";
export { useCycleStatementMobile } from "./mobile/hook";
export * from "./types";

