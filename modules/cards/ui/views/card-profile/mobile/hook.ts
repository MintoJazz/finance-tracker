"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModalHref } from "@/modules/agreements/ui/hooks/use-modal-href";
import { CardProfileInput, CardProfileMobileProps } from "../types";
import { useCardProfileData } from "../hooks/use-card-profile-data";
import { useCycleStatementMobile } from "@/modules/cycles/ui/views/cycle-statement/mobile/hook";
import { CardSummary } from "@/modules/cards/models/card.schema";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { CardActionContext } from "@/modules/cards/ui/components/card-actions-drawer";
import { useBreadcrumbLabel } from "@/components/header";
import { archiveCardAction } from "@/modules/cards/ui/actions/archive-card.action";
import { restoreCardAction } from "@/modules/cards/ui/actions/restore-card.action";

export function useCardProfileMobile({
    cardId,
    profile: initialProfile,
    initialDetail,
    initialMovements,
    range,
}: CardProfileInput): CardProfileMobileProps {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modalHref = useModalHref();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

    // 1. Busca isolada do perfil do cartão (hidratado via SSR)
    const {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    } = useCardProfileData(cardId, initialProfile);

    useBreadcrumbLabel("cardProfile", profile?.name);

    // 2. Extrai range ativo a partir da URL se presente
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");
    const effectiveRange = useMemo(() => {
        if (urlFrom && urlTo) return { from: urlFrom, to: urlTo };
        return range;
    }, [urlFrom, urlTo, range]);

    // 3. Extrato e ciclo genéricos via CycleStatement
    const statementProps = useCycleStatementMobile({
        balanceId: cardId,
        range: effectiveRange,
        scope: "CARD",
        initialDetail,
        initialMovements,
        onOpenFilters: () => setIsFilterDrawerOpen(true),
    });

    // 4. Modais de Arquivamento e Restauração
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
                const result = await archiveCardAction({ id: card.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
                await reloadProfile();
            },
            onRestoreConfirm: async (card) => {
                const result = await restoreCardAction({ id: card.id });
                if (!result.success) {
                    throw new Error(result.error);
                }
                await reloadProfile();
            },
        });

    // 5. Contexto de ações rápidas
    const cardActionsContext = useMemo<CardActionContext>(
        () => ({
            onEdit: (c) => router.push(`/cards/${c.id}/edit`),
            onAdjustLimit: (c) => router.push(modalHref(`/cards/${c.id}/adjust-limit`)),
            onAdjustDeadlines: (c) => router.push(modalHref(`/cards/${c.id}/adjust-deadlines`)),
            onArchive,
            onRestore,
        }),
        [router, modalHref, onArchive, onRestore]
    );

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
        cardActionsContext,
        archiveContext,
        restoreContext,
        statementProps,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        filters: statementProps.filters,
        applyFilters: statementProps.applyFilters,
        clearFilters: statementProps.clearFilters,
    };
}
