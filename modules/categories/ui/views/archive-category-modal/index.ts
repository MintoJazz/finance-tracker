import type { AdaptiveConfig } from "@/types/adaptive.types";
import type {
  ArchiveCategoryModalInput,
  ArchiveCategoryModalProps,
} from "./types";
import { useArchiveCategoryModal } from "./hook";
import ArchiveCategoryModalViewDesktop from "./desktop";
import ArchiveCategoryModalViewMobile from "./mobile";

export const ArchiveCategoryModalConfig: AdaptiveConfig<
  ArchiveCategoryModalInput,
  ArchiveCategoryModalProps
> = {
  views: {
    mobile: {
      hook: useArchiveCategoryModal,
      View: ArchiveCategoryModalViewMobile,
    },
    desktop: {
      hook: useArchiveCategoryModal,
      View: ArchiveCategoryModalViewDesktop,
    },
  },
};

export { ArchiveCategoryModalViewDesktop, ArchiveCategoryModalViewMobile };
export { useArchiveCategoryModal } from "./hook";
export * from "./types";

