"use client";

import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { Page } from "@/types/pagination.types";
import { MobileWalletOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getWalletsAction } from "@/modules/account/ui/actions/get-wallets.action";
import { toast } from "@/components/ui/toast";
import { useArchiveRestore } from "@/hooks/use-archive-restore";

import { archiveWalletAction } from "@/modules/account/ui/actions/archive-wallet.action";
import { restoreWalletAction } from "@/modules/account/ui/actions/restore-wallet.action";

export function useMobileWalletOverview(data: Page<WalletSummary>): MobileWalletOverviewProps {
    const { debouncedSearch, filterContext } = useOverviewFilters();
    const { onAddClick, onView, onEdit } = useCrudModals<WalletSummary>();

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
            const result = await getWalletsAction({
                pageRequest,
                filter: {
                    search: debouncedSearch || undefined,
                    showArchived: filterContext.showArchived.pressed,
                },
            });

            if (!result.success || !result.data) {
                const errorMsg = result.error ?? "Erro ao carregar carteiras";
                console.error("[useMobileWalletOverview] Falha ao carregar mais carteiras:", errorMsg);
                toast.add({
                    type: "error",
                    title: "Erro ao carregar carteiras",
                    description: errorMsg,
                    priority: "high",
                });
                return null;
            }

            return result.data;
        },
    });

    const { archiveContext, restoreContext, onArchive, onRestore } = useArchiveRestore<WalletSummary>({
        find: (item) => items.find((w) => w.id === item.id),
        onArchiveConfirm: async (wallet) => {
            const result = await archiveWalletAction({ id: wallet.id });
            if (!result.success) {
                throw new Error(result.error);
            }
        },
        onRestoreConfirm: async (wallet) => {
            const result = await restoreWalletAction({ id: wallet.id });
            if (!result.success) {
                throw new Error(result.error);
            }
        },
    });

    const actionsMenuContext = {
        onView,
        onEdit,
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
