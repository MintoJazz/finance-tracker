"use client";

import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { Page } from "@/types/pagination.types";
import { MobileCardOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getCardsAction } from "@/modules/account/ui/actions/get-cards.action";
import { toast } from "@/components/ui/toast";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveCardAction } from "../../../actions/archive-card.action";
import { restoreCardAction } from "../../../actions/restore-card.action";

export function useMobileCardOverview(
    data: Page<CardSummary>
): MobileCardOverviewProps {
    const { debouncedSearch, filterContext } = useOverviewFilters();
    const { onAddClick, onDelete: _onDelete, ...routeActionsMenuContext } =
        useCrudModals<CardSummary>();

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

    const { archiveContext, restoreContext, onArchive, onRestore } =
        useArchiveRestore<CardSummary>({
            find: (item) => items.find((c) => c.id === item.id),
            onArchiveConfirm: async (card) => {
                const result = await archiveCardAction({ id: card.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
            },
            onRestoreConfirm: async (card) => {
                const result = await restoreCardAction({ id: card.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
            },
        });

    const actionsMenuContext = {
        ...routeActionsMenuContext,
        onArchive,
        onRestore,
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
        restoreContext,
    };
}