"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WalletProfileInput, WalletProfileMobileProps } from "../types";
import { useWalletProfileData } from "../hooks/use-wallet-profile-data";
import { useWalletMovementFilters } from "@/modules/movements/ui/hooks/use-wallet-movement-filters";
import { useWalletMovementsInfinite } from "@/modules/movements/ui/hooks/use-wallet-movements-data";
import { WalletSummary } from "@/modules/wallets/models/wallet.schema";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveWalletAction } from "@/modules/wallets/ui/actions/archive-wallet.action";
import { restoreWalletAction } from "@/modules/wallets/ui/actions/restore-wallet.action";
import { useBreadcrumbLabel } from "@/components/header";
import { WalletActionContext } from "../../../components/wallet-actions-drawer";
import { MovementEntryActionContext } from "@/modules/movements/ui/components/movement-entry/movement-entry-actions-drawer";

export function useWalletProfileMobile({
    walletId,
    profile: initialProfile,
    initialMovements,
}: WalletProfileInput): WalletProfileMobileProps {
    const router = useRouter();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

    // 1. Busca isolada dos dados do perfil da carteira (hidratado via SSR)
    const {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    } = useWalletProfileData(walletId, initialProfile);

    useBreadcrumbLabel("walletProfile", profile?.name);

    // 2. Filtros sincronizados com a URL
    const {
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
    } = useWalletMovementFilters();

    // 3. Busca das movimentações em rolagem infinita (hidratado via SSR)
    const {
        items,
        total,
        hasMore,
        isLoading: isLoadingMovements,
        isLoadingMore,
        error: movementsError,
        reload: reloadMovements,
        loadMore,
        sentinelRef,
    } = useWalletMovementsInfinite(walletId, filters, 10, initialMovements);

    // 4. Modais secundários por estado (Arquivar / Desarquivar)
    const walletSummaryItem = useMemo<WalletSummary | undefined>(() => {
        if (!profile) return undefined;
        return {
            id: profile.id,
            name: profile.name,
            amount: profile.currentBalance,
            lastActivityAt: null,
            isArchived: profile.isArchived,
        };
    }, [profile]);

    const { archiveContext, restoreContext, onArchive, onRestore } =
        useArchiveRestore<WalletSummary>({
            find: (item) =>
                walletSummaryItem?.id === item.id
                    ? walletSummaryItem
                    : undefined,
            onArchiveConfirm: async (wallet) => {
                const result = await archiveWalletAction({ id: wallet.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
                await reloadProfile();
            },
            onRestoreConfirm: async (wallet) => {
                const result = await restoreWalletAction({ id: wallet.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
                await reloadProfile();
            },
        });

    // 5. Contexto de ações da carteira (Rota para Editar + Estado para Arquivar/Desarquivar)
    const walletActionsContext = useMemo<WalletActionContext>(
        () => ({
            onEdit: (w) => router.push(`/wallets/${w.id}/edit`),
            onArchive,
            onRestore,
        }),
        [router, onArchive, onRestore]
    );

    const movementActionContext = useMemo<MovementEntryActionContext>(
        () => ({
            onViewDetails: (entry) =>
                console.log("[Ação Visual] Ver detalhes lançamento:", entry.id),
            onViewReceipt: (entry) =>
                console.log("[Ação Visual] Ver comprovante:", entry.id),
        }),
        []
    );

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
        walletActionsContext,
        archiveContext,
        restoreContext,
        items,
        total,
        hasMore,
        isLoadingMovements,
        isLoadingMore,
        movementsError,
        reloadMovements,
        loadMore,
        sentinelRef,
        movementActionContext,
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
    };
}