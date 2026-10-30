import type { AdaptiveConfig } from "@/types/adaptive.types";
import type { Result } from "@/types/result.types";
import {
  type CategoryDetailTabEnum,
  type CategoryUrlTabEnum,
  CATEGORY_TAB_METADATA,
  parseCategoryUrlTab,
} from "@/modules/categories/models/category-tab.schema";

import {
  type CategoryTabActionParams,
  type TabBasicData,
  getOverviewIndicatorsAction,
  getRootIndicatorsAction,
  getRootEntriesAction,
  getChildrenAction,
  getLeafIndicatorsAction,
  getLeafEntriesAction,
} from "@/modules/categories/ui/actions/get-tab-content.action";

import { OverviewIndicatorsConfig } from "./category-overview-indicators";
import { RootIndicatorsConfig } from "./category-root-indicators";
import { RootEntriesConfig } from "./category-root-entries";
import { ChildrenConfig } from "./category-childrens";
import { LeafIndicatorsConfig } from "./category-leaf-indicators";
import { LeafEntriesConfig } from "./category-leaf-entries";

export interface CategoryTabRegistryItem<TData = TabBasicData> {
  key: CategoryDetailTabEnum;
  label: string;
  urlTab: CategoryUrlTabEnum;
  urlTabString: string;
  action: (params?: CategoryTabActionParams) => Promise<Result<TData>>;
  config: AdaptiveConfig<TData>;
}

export const CATEGORY_TAB_REGISTRY: Record<CategoryDetailTabEnum, CategoryTabRegistryItem> = {
  OVERVIEW_INDICATORS: {
    key: "OVERVIEW_INDICATORS",
    label: CATEGORY_TAB_METADATA.OVERVIEW_INDICATORS.label,
    urlTab: CATEGORY_TAB_METADATA.OVERVIEW_INDICATORS.urlTab,
    urlTabString: CATEGORY_TAB_METADATA.OVERVIEW_INDICATORS.urlTabString,
    action: getOverviewIndicatorsAction,
    config: OverviewIndicatorsConfig,
  },
  ROOT_INDICATORS: {
    key: "ROOT_INDICATORS",
    label: CATEGORY_TAB_METADATA.ROOT_INDICATORS.label,
    urlTab: CATEGORY_TAB_METADATA.ROOT_INDICATORS.urlTab,
    urlTabString: CATEGORY_TAB_METADATA.ROOT_INDICATORS.urlTabString,
    action: getRootIndicatorsAction,
    config: RootIndicatorsConfig,
  },
  ROOT_ENTRIES: {
    key: "ROOT_ENTRIES",
    label: CATEGORY_TAB_METADATA.ROOT_ENTRIES.label,
    urlTab: CATEGORY_TAB_METADATA.ROOT_ENTRIES.urlTab,
    urlTabString: CATEGORY_TAB_METADATA.ROOT_ENTRIES.urlTabString,
    action: getRootEntriesAction,
    config: RootEntriesConfig,
  },
  CHILDREN: {
    key: "CHILDREN",
    label: CATEGORY_TAB_METADATA.CHILDREN.label,
    urlTab: CATEGORY_TAB_METADATA.CHILDREN.urlTab,
    urlTabString: CATEGORY_TAB_METADATA.CHILDREN.urlTabString,
    action: getChildrenAction,
    config: ChildrenConfig,
  },
  LEAF_INDICATORS: {
    key: "LEAF_INDICATORS",
    label: CATEGORY_TAB_METADATA.LEAF_INDICATORS.label,
    urlTab: CATEGORY_TAB_METADATA.LEAF_INDICATORS.urlTab,
    urlTabString: CATEGORY_TAB_METADATA.LEAF_INDICATORS.urlTabString,
    action: getLeafIndicatorsAction,
    config: LeafIndicatorsConfig,
  },
  LEAF_ENTRIES: {
    key: "LEAF_ENTRIES",
    label: CATEGORY_TAB_METADATA.LEAF_ENTRIES.label,
    urlTab: CATEGORY_TAB_METADATA.LEAF_ENTRIES.urlTab,
    urlTabString: CATEGORY_TAB_METADATA.LEAF_ENTRIES.urlTabString,
    action: getLeafEntriesAction,
    config: LeafEntriesConfig,
  },
};

/**
 * Resolve a aba ativa a partir da lista de abas disponíveis da categoria e do parâmetro da URL.
 */
export function resolveActiveTab(
  availableTabs: CategoryDetailTabEnum[],
  requestedUrlTab?: string | null
): CategoryTabRegistryItem {
  if (!availableTabs.length) {
    return CATEGORY_TAB_REGISTRY.OVERVIEW_INDICATORS;
  }

  const parsedUrlTab = parseCategoryUrlTab(requestedUrlTab);

  if (parsedUrlTab) {
    const matchedTabKey = availableTabs.find(
      (tabKey) => CATEGORY_TAB_REGISTRY[tabKey]?.urlTab === parsedUrlTab
    );
    if (matchedTabKey) {
      return CATEGORY_TAB_REGISTRY[matchedTabKey];
    }
  }

  // Fallback: primeira aba disponível
  const fallbackKey = availableTabs[0];
  return CATEGORY_TAB_REGISTRY[fallbackKey];
}
