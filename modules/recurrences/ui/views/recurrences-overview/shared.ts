"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";
import { filterRecurrences } from "@/modules/recurrences/infra/mock/recurrences.mock";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import { useRecurrenceFilters } from "@/modules/recurrences/ui/hooks/use-recurrence-filters";
import type { RecurrenceActionContext } from "../../components/recurrence-actions-drawer";

/**
 * Hook compartilhado entre as visões Desktop e Mobile para filtragem e ações da listagem.
 */
export function useRecurrenceOverviewShared(rawData: RecurrenceListItem[]) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const {
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        applyFilters,
        clearFilters,
        clearAllFilters,
    } = useRecurrenceFilters();

    const filteredItems = useMemo(
        () => filterRecurrences(rawData, filters),
        [rawData, filters]
    );

    const onAddClick = () => {
        toast.add({
            type: "info",
            title: "Em breve",
            description: "O cadastro de recorrências estará disponível em breve.",
        });
    };

    const actionsMenuContext = useMemo<RecurrenceActionContext>(
        () => ({
            onView: (recurrence) => {
                toast.add({
                    type: "info",
                    title: recurrence.name,
                    description: "A tela de detalhes da recorrência será implementada na próxima etapa.",
                });
            },
            onEdit: (recurrence) => {
                toast.add({
                    type: "info",
                    title: `Editar ${recurrence.name}`,
                    description: "A edição de recorrências será implementada na próxima etapa.",
                });
            },
        }),
        []
    );

    return {
        filteredItems,
        actionsMenuContext,
        onAddClick,
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        applyFilters,
        clearFilters,
        clearAllFilters,
        isFilterOpen,
        setIsFilterOpen,
    };
}

