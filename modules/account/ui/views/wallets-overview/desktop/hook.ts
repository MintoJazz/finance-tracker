"use client";

import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { Page } from "@/types/pagination.types";
import { WalletOverviewProps } from "../types";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { useCrudModals } from "@/hooks/use-crud-modals";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveWalletAction } from "@/modules/account/ui/actions/archive-wallet.action";
import { restoreWalletAction } from "@/modules/account/ui/actions/restore-wallet.action";

export function useWalletOverview(data: Page<WalletSummary>): WalletOverviewProps {
    const { filterContext } = useOverviewFilters();
    const { onAddClick, ...routeActionsMenuContext } = useCrudModals<WalletSummary>();
    const { paginationContext } = usePaginationQueryParams();

    const { archiveContext, restoreContext, onArchive, onRestore } = useArchiveRestore<WalletSummary>({
        find: (item) => data.data.find((w) => w.id === item.id),
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
        ...routeActionsMenuContext,
        onArchive,
        onRestore,
    };

    return {
        data,
        onAddClick,
        actionsMenuContext,
        filterContext,
        paginationContext,
        archiveContext,
        restoreContext,
    };
}