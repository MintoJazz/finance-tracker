"use client";

import { CardSummary } from "@/modules/cards/models/card.schema";
import { Page } from "@/types/pagination.types";
import { MobileCardOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getCardsAction } from "@/modules/cards/ui/actions/get-cards.action";
import { toast } from "@/components/ui/toast";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveCardAction } from "../../../actions/archive-card.action";

export function useMobileCardOverview(
    data: Page<CardSummary>
): MobileCardOverviewProps {
    const { debouncedSearch, filterContext } = useOverviewFilters();
    const { onAddClick, onView, onEdit } = useCrudModals<CardSummary>();

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
                },
            });

            if (!result.success || !result.data) {
                const errorMsg = result.error ?? "Erro ao carregar cartões";
                console.error(
                    "[useMobileCardOverview] Falha ao carregar mais cartões:",
                    errorMsg
                );
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

    const { archiveContext, onArchive } =
        useArchiveRestore<CardSummary>({
            find: (item) => items.find((c) => c.id === item.id),
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
        items,
        total,
        hasMore,
        isLoadingMore,
        loadMore,
        sentinelRef,
        actionsMenuContext,
        filterContext,
        onAddClick,
        archiveContext,
    };
}