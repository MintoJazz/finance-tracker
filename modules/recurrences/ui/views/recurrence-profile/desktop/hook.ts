"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalHref } from "@/modules/agreements/ui/hooks/use-modal-href";
import { toast } from "@/components/ui/toast";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveRecurrenceAction } from "@/modules/recurrences/ui/actions/archive-recurrence.action";
import { useRecurrenceStatusActions } from "@/modules/recurrences/ui/hooks/use-recurrence-status-actions";
import { useBreadcrumbLabel } from "@/components/header";
import type {
    RecurrenceProfileDesktopProps,
    RecurrenceProfileInput,
} from "../types";
import { useRecurrenceProfileData } from "../hooks/use-recurrence-profile-data";
import { useRecurrenceCyclesData } from "../hooks/use-recurrence-cycles-data";
import { useRecurrenceCycleFilters } from "@/modules/recurrences/ui/hooks/use-recurrence-cycle-filters";
import type { RecurrenceCycleActionContext } from "@/modules/recurrences/ui/components/recurrence-cycle-table/actions";

export function useRecurrenceProfileDesktop({
    balanceId,
    profile: initialProfile,
    initialCyclesData,
}: RecurrenceProfileInput): RecurrenceProfileDesktopProps {
    const [isVisible, setIsVisible] = useState(true);
    const [isRecurrenceActionsOpen, setIsRecurrenceActionsOpen] = useState(false);

    // 1. Perfil da Recorrência (SSR + cliente)
    const {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    } = useRecurrenceProfileData(balanceId, initialProfile);

    // Atualiza dinamicamente o breadcrumb com o nome da recorrência
    useBreadcrumbLabel("recurrenceProfile", profile?.name);

    // 2. Filtros de ciclos sincronizados com a URL (offset, status, includeProjected, from, to)
    const {
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        dateRange,
        applyFilters,
        onSelectDateRange,
        onResetDateRange,
        onNavigateOffset,
        onPrevHorizon,
        onNextHorizon,
        clearFilters,
    } = useRecurrenceCycleFilters();

    // 3. Ciclos da recorrência no macro-horizonte ativo
    const {
        horizon,
        cycles,
        isLoadingCycles,
        cyclesError,
    } = useRecurrenceCyclesData({
        balanceId,
        filters,
        initialData: initialCyclesData,
    });

    // 4. Ações de ciclo
    const actionContext = useMemo<RecurrenceCycleActionContext>(
        () => ({
            onViewCycle: (cycle) => {
                toast.add({
                    type: "info",
                    title: cycle.label,
                    description: `Período: ${cycle.from} a ${cycle.to}. O extrato detalhado do ciclo será implementado nas próximas etapas.`,
                });
            },
            onSettleCycle: (cycle) => {
                toast.add({
                    type: "info",
                    title: `Liquidar ${cycle.label}`,
                    description:
                        "O registro de quitação/baixa do ciclo estará disponível em breve.",
                });
            },
        }),
        []
    );

    const router = useRouter();
    const modalHref = useModalHref();

    const onAdjustAmount = () => {
        router.push(modalHref(`/recurrences/${balanceId}/adjust-amount`));
    };

    const onAdjustDeadlines = () => {
        router.push(modalHref(`/recurrences/${balanceId}/adjust-deadlines`));
    };

    const onEditRecurrence = () => {
        router.push(modalHref(`/recurrences/${balanceId}/edit`));
    };

    const { setActive } = useRecurrenceStatusActions(reloadProfile);

    const onToggleActiveRecurrence = () => {
        if (!profile) return;
        void setActive(balanceId, profile.name, !profile.isActive);
    };

    const { archiveContext, onArchive } = useArchiveRestore<{
        id: number;
        name: string;
    }>({
        entityName: "Recorrência",
        find: (item) =>
            profile && profile.balanceId === item.id
                ? { id: profile.balanceId, name: profile.name }
                : undefined,
        onArchiveConfirm: async (recurrence) => {
            const result = await archiveRecurrenceAction({ id: recurrence.id });
            if (!result.success) {
                throw new Error(result.error);
            }
            router.replace("/recurrences");
        },
    });

    const onArchiveRecurrence = () => {
        if (!profile) return;
        onArchive({ id: profile.balanceId, name: profile.name });
    };

    const onOpenRecurrenceActions = () => {
        setIsRecurrenceActionsOpen(true);
    };

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
        horizon,
        cycles,
        isLoadingCycles,
        cyclesError,
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        dateRange,
        applyFilters,
        onSelectDateRange,
        onResetDateRange,
        onNavigateOffset,
        onPrevHorizon,
        onNextHorizon,
        clearFilters,
        isVisible,
        setIsVisible,
        actionContext,
        onEditRecurrence,
        onAdjustAmount,
        onAdjustDeadlines,
        onToggleActiveRecurrence,
        onArchiveRecurrence,
        archiveContext,
        onOpenRecurrenceActions,
        isRecurrenceActionsOpen,
        setIsRecurrenceActionsOpen,
    };
}
