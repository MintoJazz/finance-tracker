import { AdaptiveConfig } from "@/types/adaptive.types";
import type { RenameContractModalInput, RenameContractModalProps } from "./types";
import { useRenameContractModal } from "./hook";
import RenameContractModalViewDesktop from "./desktop";
import RenameContractModalViewMobile from "./mobile";

export const RenameContractModalConfig: AdaptiveConfig<
  RenameContractModalInput,
  RenameContractModalProps
> = {
  views: {
    mobile: {
      hook: useRenameContractModal,
      View: RenameContractModalViewMobile,
    },
    desktop: {
      hook: useRenameContractModal,
      View: RenameContractModalViewDesktop,
    },
  },
};

export { useRenameContractModal } from "./hook";
export * from "./types";
