"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardProfileInput, CardProfileMobileProps } from "../types";
import {
    useCardCycleNavigation,
    useCardProfileData,
} from "../hooks/use-card-profile-data";
import { useWalletMovementFilters } from "@/modules/ledger/ui/hooks/use-wallet-movement-filters";
import { useCardMovementsInfinite } from "@/modules/ledger/ui/hooks/use-card-movements-data";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { CardActionContext } from "@/modules/account/ui/components/card-actions-drawer";
import { useBreadcrumbLabel } from "@/components/header";
import { MovementActionContext } from "@/modules/ledger/ui/components/wallet-movements-actions-menu";

export function useCardProfileMobile({
    cardId,
}: CardProfileInput): CardProfileMobileProps {
    const router = useRouter();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

    // 1. Busca isolada do perfil + lista de ciclos do cartão
    const {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    } = useCardProfileData(cardId);

    useBreadcrumbLabel("cardProfile", profile?.name);

    // 2. Filtros sincronizados na URL
    const { filters, applyFilters } = useWalletMovementFilters();

    // 3. Resolução do ciclo ativo (from/to)
    const {
        cycleNavigation,
        effectiveFilters,
        activeExtraFilterCount,
        clearExtraFilters,
    } = useCardCycleNavigation(profile, filters, applyFilters);

    // 4. Busca em scroll infinito apenas do ciclo ativo
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
    } = useCardMovementsInfinite(cardId, effectiveFilters);

    // 5. Modais secundários por estado (Arquivar / Desarquivar)
    const cardSummaryItem = useMemo<CardSummary | undefined>(() => {
        if (!profile) return undefined;
        return {
            id: profile.id,
            name: profile.name,
            limit: profile.limit,
            usedLimit: profile.usedLimit,
            availableLimit: profile.availableLimit,
            closingDay: profile.closingDay,
            dueDay: profile.dueDay,
            lastActivityAt: null,
            isArchived: profile.isArchived,
        };
    }, [profile]);

    const { archiveContext, restoreContext, onArchive, onRestore } =
        useArchiveRestore<CardSummary>({
            find: (item) =>
                cardSummaryItem?.id === item.id ? cardSummaryItem : undefined,
            onArchiveConfirm: async (card) => {
                await new Promise((resolve) => setTimeout(resolve, 400));
                console.log("[useCardProfileMobile] Arquivar cartão (mock):", card.id);
                await reloadProfile();
            },
            onRestoreConfirm: async (card) => {
                await new Promise((resolve) => setTimeout(resolve, 400));
                console.log("[useCardProfileMobile] Desarquivar cartão (mock):", card.id);
                await reloadProfile();
            },
        });

    // 6. Contexto de ações do cartão (Rota para Editar + Estado para Arquivar/Desarquivar)
    const cardActionsContext = useMemo<CardActionContext>(
        () => ({
            onEdit: (c) => router.push(`/cards/${c.id}/edit`),
            onArchive,
            onRestore,
        }),
        [router, onArchive, onRestore]
    );

    const movementActionContext = useMemo<MovementActionContext>(
        () => ({
            onViewDetails: (m) =>
                console.log("[Ação Visual] Ver detalhes lançamento:", m.movementId),
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
        cardActionsContext,
        archiveContext,
        restoreContext,
        cycleNavigation,
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
        filters: effectiveFilters,
        activeFilterCount: activeExtraFilterCount,
        applyFilters,
        clearFilters: clearExtraFilters,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
    };
}