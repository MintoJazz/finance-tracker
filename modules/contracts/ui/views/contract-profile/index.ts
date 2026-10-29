import { AdaptiveConfig } from "@/types/adaptive.types";
import { ContractProfileInput } from "./types";
import ContractProfileViewDesktop from "./desktop";
import { useContractProfileDesktop } from "./desktop/hook";
import ContractProfileViewMobile from "./mobile";
import { useContractProfileMobile } from "./mobile/hook";

export const ContractProfileAdaptiveConfig: AdaptiveConfig<ContractProfileInput> = {
    views: {
        mobile: {
            hook: useContractProfileMobile,
            View: ContractProfileViewMobile,
        },
        desktop: {
            hook: useContractProfileDesktop,
            View: ContractProfileViewDesktop,
        },
    },
};

export * from "./types";
export { default as ContractProfileViewDesktop } from "./desktop";
export { default as ContractProfileViewMobile } from "./mobile";
