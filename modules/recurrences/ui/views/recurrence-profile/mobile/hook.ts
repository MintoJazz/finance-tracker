"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useBreadcrumbLabel } from "@/components/header";
import type {
    RecurrenceProfileInput,
    RecurrenceProfileMobileProps,
} from "../types";
import { useRecurrenceProfileData } from "../hooks/use-recurrence-profile-data";
import { useRecurrenceCyclesData } from "../hooks/use-recurrence-cycles-data";
import { useRecurrenceCycleFilters } from "@/modules/recurrences/ui/hooks/use-recurrence-cycle-filters";
import type { RecurrenceCycleActionContext } from "@/modules/recurrences/ui/components/recurrence-cycle-table/actions";

export function useRecurrenceProfileMobile({
    balanceId,
    profile: initialProfile,
    initialCyclesData,
}: RecurrenceProfileInput): RecurrenceProfileMobileProps {
    const [isVisible, setIsVisible] = useState(true);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isRecurrenceActionsOpen, setIsRecurrenceActionsOpen] = useState(false);

    // 1. Perfil da Recorrência
    const {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    } = useRecurrenceProfileData(balanceId, initialProfile);

    // Atualiza dinamicamente o breadcrumb
    useBreadcrumbLabel("recurrenceProfile", profile?.name);

    // 2. Filtros na URL (offset, status, includeProjected, from, to)
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

    // 3. Ciclos da recorrência
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

    // 4. Ações
    const actionContext = useMemo<RecurrenceCycleActionContext>(
        () => ({
            onViewCycle: (cycle) => {
                toast.add({
                    type: "info",
                    title: cycle.label,
                    description: `Período: ${cycle.from} a ${cycle.to}.`,
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

    const onEditRecurrence = () => {
        toast.add({
            type: "info",
            title: `Editar ${profile?.name ?? "Recorrência"}`,
            description: "O fluxo de edição de recorrência estará disponível em breve.",
        });
    };

    const onToggleActiveRecurrence = () => {
        toast.add({
            type: "info",
            title: profile?.isActive ? "Pausar Recorrência" : "Ativar Recorrência",
            description: "Alteração de status em breve.",
        });
    };

    const onOpenRecurrenceActions = () => {
        setIsRecurrenceActionsOpen(true);
    };

    const onSelectCycle = (cycle: (typeof cycles)[number]) => {
        toast.add({
            type: "info",
            title: cycle.label,
            description: `Vencimento: ${cycle.dueDate}. Status: ${cycle.status}.`,
        });
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
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        isRecurrenceActionsOpen,
        setIsRecurrenceActionsOpen,
        onEditRecurrence,
        onToggleActiveRecurrence,
        onOpenRecurrenceActions,
        onSelectCycle,
    };
}
