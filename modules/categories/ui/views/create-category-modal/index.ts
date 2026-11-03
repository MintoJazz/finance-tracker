import { AdaptiveConfig } from "@/types/adaptive.types";
import type {
  CreateCategoryModalInput,
  CreateCategoryModalProps,
} from "./types";
import { useCreateCategoryModal } from "./hook";
import CreateCategoryModalViewDesktop from "./desktop";
import CreateCategoryModalViewMobile from "./mobile";

export const CreateCategoryModalConfig: AdaptiveConfig<
  CreateCategoryModalInput,
  CreateCategoryModalProps
> = {
  views: {
    mobile: {
      hook: useCreateCategoryModal,
      View: CreateCategoryModalViewMobile,
    },
    desktop: {
      hook: useCreateCategoryModal,
      View: CreateCategoryModalViewDesktop,
    },
  },
};

export { useCreateCategoryModal } from "./hook";
export * from "./types";

