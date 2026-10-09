"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { WalletProfileInput, WalletProfileDesktopProps } from "../types";
import { useWalletProfileData } from "../hooks/use-wallet-profile-data";
import { useWalletMovementFilters } from "@/modules/ledger/ui/hooks/use-wallet-movement-filters";
import { useWalletMovementsPaginated } from "@/modules/ledger/ui/hooks/use-wallet-movements-data";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveWalletAction } from "@/modules/account/ui/actions/archive-wallet.action";
import { restoreWalletAction } from "@/modules/account/ui/actions/restore-wallet.action";
import { useBreadcrumbLabel } from "@/components/header";
import { WalletActionContext } from "../../../components/wallet-actions-drawer";
import { MovementActionContext } from "@/modules/ledger/ui/components/wallet-movements-actions-menu";

export function useWalletProfileDesktop({
    walletId,
    profile: initialProfile,
    initialMovements,
}: WalletProfileInput): WalletProfileDesktopProps {
    const router = useRouter();

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

    // 3. Busca das movimentações paginadas (hidratado via SSR)
    const {
        data: movementsData,
        isLoading: isLoadingMovements,
        error: movementsError,
        reload: reloadMovements,
        paginationContext,
    } = useWalletMovementsPaginated(walletId, filters, initialMovements);

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

    const movementActionContext = useMemo<MovementActionContext>(
        () => ({
            onViewDetails: (m) =>
                console.log("[Ação Visual] Ver detalhes movimentação:", m.movementId),
            onViewReceipt: (m) =>
                console.log("[Ação Visual] Ver comprovante:", m.movementId),
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
        movementsData,
        isLoadingMovements,
        movementsError,
        reloadMovements,
        movementActionContext,
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
        paginationContext,
    };
}