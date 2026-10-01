import { AdaptiveConfig } from "@/types/adaptive.types";
import CardsOverviewViewDesktop from "./desktop";
import { useCardOverview } from "./desktop/hook";
import CardsOverviewViewMobile from "./mobile";
import { useMobileCardOverview } from "./mobile/hook";
import { Page } from "@/types/pagination.types";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";

export const CardsOverviewConfig: AdaptiveConfig<Page<CardSummary>> = {
    views: {
        mobile: {
            hook: useMobileCardOverview,
            View: CardsOverviewViewMobile,
        },
        desktop: {
            hook: useCardOverview,
            View: CardsOverviewViewDesktop,
        },
    },
};
