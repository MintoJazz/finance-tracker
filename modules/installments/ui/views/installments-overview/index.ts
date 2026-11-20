import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import type { AdaptiveConfig } from "@/types/adaptive.types";
import InstallmentsOverviewViewDesktop from "./desktop";
import { useInstallmentOverview } from "./desktop/hook";
import InstallmentsOverviewViewMobile from "./mobile";
import { useMobileInstallmentOverview } from "./mobile/hook";

export const InstallmentsOverviewConfig: AdaptiveConfig<InstallmentListItem[]> = {
    views: {
        mobile: {
            hook: useMobileInstallmentOverview,
            View: InstallmentsOverviewViewMobile,
        },
        desktop: {
            hook: useInstallmentOverview,
            View: InstallmentsOverviewViewDesktop,
        },
    },
};
