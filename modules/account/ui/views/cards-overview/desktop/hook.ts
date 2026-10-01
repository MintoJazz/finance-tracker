"use client";

import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { Page } from "@/types/pagination.types";
import { CardOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";

export function useCardOverview(data: Page<CardSummary>): CardOverviewProps {
    const { filterContext } = useOverviewFilters();
    const { onAddClick, actionsMenuContext } = useCrudModals<CardSummary>();
    const { paginationContext } = usePaginationQueryParams();

    return {
        data,
        onAddClick,
        actionsMenuContext,
        filterContext,
        paginationContext,
    };
}
