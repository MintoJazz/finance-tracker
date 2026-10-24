import { AdaptiveConfig } from "@/types/adaptive.types";
import type { AdjustContractLimitsModalInput, AdjustContractLimitsModalProps } from "./types";
import { useAdjustContractLimitsModal } from "./hook";
import AdjustContractLimitsModalViewDesktop from "./desktop";
import AdjustContractLimitsModalViewMobile from "./mobile";

export const AdjustContractLimitsModalConfig: AdaptiveConfig<
  AdjustContractLimitsModalInput,
  AdjustContractLimitsModalProps
> = {
  views: {
    mobile: {
      hook: useAdjustContractLimitsModal,
      View: AdjustContractLimitsModalViewMobile,
    },
    desktop: {
      hook: useAdjustContractLimitsModal,
      View: AdjustContractLimitsModalViewDesktop,
    },
  },
};

export { useAdjustContractLimitsModal } from "./hook";
export * from "./types";
