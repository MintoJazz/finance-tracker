"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";
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
        toast.add({
            type: "info",
            title: "Ações da Recorrência",
            description: "Opções avançadas estarão disponíveis em breve.",
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
        onEditRecurrence,
        onToggleActiveRecurrence,
        onOpenRecurrenceActions,
    };
}
