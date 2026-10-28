import { AdaptiveConfig } from "@/types/adaptive.types";
import { ContractCycleProfileInput } from "./types";
import ContractCycleProfileViewDesktop from "./desktop";
import { useContractCycleProfileDesktop } from "./desktop/hook";
import ContractCycleProfileViewMobile from "./mobile";
import { useContractCycleProfileMobile } from "./mobile/hook";

export const ContractCycleProfileAdaptiveConfig: AdaptiveConfig<ContractCycleProfileInput> = {
    views: {
        mobile: {
            hook: useContractCycleProfileMobile,
            View: ContractCycleProfileViewMobile,
        },
        desktop: {
            hook: useContractCycleProfileDesktop,
            View: ContractCycleProfileViewDesktop,
        },
    },
};

export * from "./types";
export { default as ContractCycleProfileViewDesktop } from "./desktop";
export { default as ContractCycleProfileViewMobile } from "./mobile";
