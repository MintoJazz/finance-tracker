import { AdaptiveConfig } from "@/types/adaptive.types";
import { EditContractModalInput, EditContractModalProps } from "./types";
import { useEditContractModal } from "./hook";
import EditContractModalViewDesktop from "./desktop";
import EditContractModalViewMobile from "./mobile";

export const EditContractModalConfig: AdaptiveConfig<
  EditContractModalInput,
  EditContractModalProps
> = {
  views: {
    mobile: {
      hook: useEditContractModal,
      View: EditContractModalViewMobile,
    },
    desktop: {
      hook: useEditContractModal,
      View: EditContractModalViewDesktop,
    },
  },
};

export { useEditContractModal } from "./hook";
export * from "./types";
