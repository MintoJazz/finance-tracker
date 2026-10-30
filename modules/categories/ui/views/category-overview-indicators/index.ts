import type { AdaptiveConfig } from "@/types/adaptive.types";
import type { TabBasicData } from "@/modules/categories/ui/actions/get-tab-content.action";
import {
  useTabPlaceholder,
  TabPlaceholderDesktop,
  TabPlaceholderMobile,
} from "@/modules/categories/ui/components/category-tab-placeholder";

export const OverviewIndicatorsConfig: AdaptiveConfig<TabBasicData, { data: TabBasicData }> = {
  views: {
    desktop: {
      hook: useTabPlaceholder,
      View: TabPlaceholderDesktop,
    },
    mobile: {
      hook: useTabPlaceholder,
      View: TabPlaceholderMobile,
    },
  },
};

export default OverviewIndicatorsConfig;

