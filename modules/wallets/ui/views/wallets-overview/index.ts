import { AdaptiveConfig } from "@/types/adaptive.types";
import WalletsOverviewViewDesktop from "./desktop";
import { useWalletOverview } from "./desktop/hook";
import WalletsOverviewViewMobile from "./mobile";
import { useMobileWalletOverview } from "./mobile/hook";
import { Page } from "@/types/pagination.types";
import { WalletSummary } from "@/modules/wallets/models/wallet.schema";

export const WalletsOverviewConfig: AdaptiveConfig<Page<WalletSummary>> = {
    views: {
        mobile: {
            hook: useMobileWalletOverview,
            View: WalletsOverviewViewMobile
        },
        desktop: {
            hook: useWalletOverview,
            View: WalletsOverviewViewDesktop
        }
    }
}