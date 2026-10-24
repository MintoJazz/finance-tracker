import { AdaptiveConfig } from "@/types/adaptive.types";
import type { AdjustContractScheduleModalInput, AdjustContractScheduleModalProps } from "./types";
import { useAdjustContractScheduleModal } from "./hook";
import AdjustContractScheduleModalViewDesktop from "./desktop";
import AdjustContractScheduleModalViewMobile from "./mobile";

export const AdjustContractScheduleModalConfig: AdaptiveConfig<
  AdjustContractScheduleModalInput,
  AdjustContractScheduleModalProps
> = {
  views: {
    mobile: {
      hook: useAdjustContractScheduleModal,
      View: AdjustContractScheduleModalViewMobile,
    },
    desktop: {
      hook: useAdjustContractScheduleModal,
      View: AdjustContractScheduleModalViewDesktop,
    },
  },
};

export { useAdjustContractScheduleModal } from "./hook";
export * from "./types";
