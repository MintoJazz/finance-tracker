"use client";

import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { Page } from "@/types/pagination.types";
import { MobileCardOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getCardsAction } from "@/modules/account/ui/actions/get-cards.action";
import { toast } from "@/components/ui/toast";

export function useMobileCardOverview(data: Page<CardSummary>): MobileCardOverviewProps {
    const { debouncedSearch, filterContext } = useOverviewFilters();
    const { onAddClick, actionsMenuContext } = useCrudModals<CardSummary>();

    const {
        items,
        total,
        hasMore,
        isLoadingMore,
        loadMore,
        sentinelRef,
    } = useInfiniteScroll({
        data,
        fetchNextPage: async (pageRequest) => {
            const result = await getCardsAction({
                pageRequest,
                filter: {
                    search: debouncedSearch || undefined,
                    showArchived: filterContext.showArchived.pressed,
                },
            });

            if (!result.success || !result.data) {
                const errorMsg = result.error ?? "Erro ao carregar cartões";
                console.error("[useMobileCardOverview] Falha ao carregar mais cartões:", errorMsg);
                toast.add({
                    type: "error",
                    title: "Erro ao carregar cartões",
                    description: errorMsg,
                    priority: "high",
                });
                return null;
            }

            return result.data;
        },
    });

    return {
        items,
        total,
        hasMore,
        isLoadingMore,
        loadMore,
        sentinelRef,
        actionsMenuContext,
        filterContext,
        onAddClick,
    };
}
