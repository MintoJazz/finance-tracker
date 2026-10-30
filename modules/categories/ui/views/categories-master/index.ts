import type { AdaptiveConfig } from "@/types/adaptive.types";
import type { CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import CategoriesMasterViewDesktop from "./desktop";
import { useDesktopCategoriesMaster } from "./desktop/hook";
import CategoriesMasterViewMobile from "./mobile";
import { useMobileCategoriesMaster } from "./mobile/hook";

export const CategoriesMasterConfig: AdaptiveConfig<CategoryTreeDTO> = {
  views: {
    desktop: {
      hook: useDesktopCategoriesMaster,
      View: CategoriesMasterViewDesktop,
    },
    mobile: {
      hook: useMobileCategoriesMaster,
      View: CategoriesMasterViewMobile,
    },
  },
};

export default CategoriesMasterConfig;
export * from "./types";
