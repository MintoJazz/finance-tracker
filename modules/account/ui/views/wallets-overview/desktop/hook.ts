"use client";

import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { Page } from "@/types/pagination.types";
import { WalletOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";

export function useWalletOverview(data: Page<WalletSummary>): WalletOverviewProps {
    const { filterContext } = useOverviewFilters();
    const { onAddClick, actionsMenuContext } = useCrudModals<WalletSummary>();
    const { paginationContext } = usePaginationQueryParams();

    return {
        data,
        onAddClick,
        actionsMenuContext,
        filterContext,
        paginationContext,
    };
}