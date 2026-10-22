"use client";

import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { Page } from "@/types/pagination.types";
import { CardOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveCardAction } from "../../../actions/archive-card.action";

export function useCardOverview(data: Page<CardSummary>): CardOverviewProps {
    const { filterContext } = useOverviewFilters();
    const { onAddClick, onView, onEdit } = useCrudModals<CardSummary>();
    const { paginationContext } = usePaginationQueryParams();

    const { archiveContext, onArchive } =
        useArchiveRestore<CardSummary>({
            find: (item) => data.data.find((c) => c.id === item.id),
            onArchiveConfirm: async (card) => {
                const result = await archiveCardAction({ id: card.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
            },
        });

    const actionsMenuContext = {
        onView,
        onEdit,
        onArchive,
    };

    return {
        data,
        onAddClick,
        actionsMenuContext,
        filterContext,
        paginationContext,
        archiveContext,
    };
}