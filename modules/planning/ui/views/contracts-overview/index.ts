import { AdaptiveConfig } from "@/types/adaptive.types";
import { Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts } from "../../../core/schemas/contract.schema";
import ContractsOverviewViewDesktop from "./desktop";
import { useContractsOverview } from "./desktop/hook";
import ContractsOverviewViewMobile from "./mobile";
import { useMobileContractsOverview } from "./mobile/hook";

export const ContractsOverviewConfig: AdaptiveConfig<{ page: Page<ContractSummaryItem>; counts: ContractTypeCounts }> = {
  views: {
    mobile: {
      hook: useMobileContractsOverview,
      View: ContractsOverviewViewMobile,
    },
    desktop: {
      hook: useContractsOverview,
      View: ContractsOverviewViewDesktop,
    },
  },
};
