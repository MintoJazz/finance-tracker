import { AdaptiveConfig } from "@/types/adaptive.types";
import { CreateContractModalInput, CreateContractModalProps } from "./types";
import { useCreateContractModal } from "./hook";
import CreateContractModalViewDesktop from "./desktop";
import CreateContractModalViewMobile from "./mobile";

export const CreateContractModalConfig: AdaptiveConfig<
  CreateContractModalInput,
  CreateContractModalProps
> = {
  views: {
    mobile: {
      hook: useCreateContractModal,
      View: CreateContractModalViewMobile,
    },
    desktop: {
      hook: useCreateContractModal,
      View: CreateContractModalViewDesktop,
    },
  },
};

export { useCreateContractModal } from "./hook";
export * from "./types";
