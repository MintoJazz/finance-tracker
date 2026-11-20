"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";
import { filterInstallments } from "@/modules/installments/infra/mock/installments.mock";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import { useInstallmentFilters } from "@/modules/installments/ui/hooks/use-installment-filters";
import type { InstallmentActionContext } from "../../components/installment-actions-drawer";

/** Ações ainda sem backend: apenas avisam que a funcionalidade está a caminho. */
function notifyComingSoon(title: string) {
    toast.add({
        type: "info",
        title,
        description: "Esta funcionalidade estará disponível em breve.",
    });
}

/**
 * Hook compartilhado entre as visões Desktop e Mobile para filtragem e ações da listagem.
 */
export function useInstallmentOverviewShared(rawData: InstallmentListItem[]) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const {
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        applyFilters,
        clearFilters,
        clearAllFilters,
    } = useInstallmentFilters();

    const filteredItems = useMemo(
        () => filterInstallments(rawData, filters),
        [rawData, filters]
    );

    const onAddClick = () => notifyComingSoon("Novo parcelamento");

    const actionsMenuContext = useMemo<InstallmentActionContext>(
        () => ({
            onView: (installment) =>
                notifyComingSoon(`Detalhes de ${installment.description}`),
            onEdit: (installment) =>
                notifyComingSoon(`Editar ${installment.description}`),
            onArchive: (installment) =>
                notifyComingSoon(`Arquivar ${installment.description}`),
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
