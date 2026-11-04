import { AdaptiveConfig } from "@/types/adaptive.types";
import type {
  EditCategoryModalInput,
  EditCategoryModalProps,
} from "./types";
import { useEditCategoryModal } from "./hook";
import EditCategoryModalViewDesktop from "./desktop";
import EditCategoryModalViewMobile from "./mobile";

export const EditCategoryModalConfig: AdaptiveConfig<
  EditCategoryModalInput,
  EditCategoryModalProps
> = {
  views: {
    mobile: {
      hook: useEditCategoryModal,
      View: EditCategoryModalViewMobile,
    },
    desktop: {
      hook: useEditCategoryModal,
      View: EditCategoryModalViewDesktop,
    },
  },
};

export { useEditCategoryModal } from "./hook";
export * from "./types";

