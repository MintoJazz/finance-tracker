"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalHref } from "@/modules/agreements/ui/hooks/use-modal-href";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { archiveRecurrenceAction } from "@/modules/recurrences/ui/actions/archive-recurrence.action";
import { useRecurrenceStatusActions } from "@/modules/recurrences/ui/hooks/use-recurrence-status-actions";
import { filterRecurrences } from "@/modules/recurrences/infra/mock/recurrences.mock";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import { useRecurrenceFilters } from "@/modules/recurrences/ui/hooks/use-recurrence-filters";
import type { RecurrenceActionContext } from "../../components/recurrence-actions-drawer";

/**
 * Hook compartilhado entre as visões Desktop e Mobile para filtragem e ações da listagem.
 */
export function useRecurrenceOverviewShared(rawData: RecurrenceListItem[]) {
    const router = useRouter();
    const modalHref = useModalHref();
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

    const { setActive } = useRecurrenceStatusActions();

    const { archiveContext, onArchive } = useArchiveRestore<{
        id: number;
        name: string;
    }>({
        entityName: "Recorrência",
        find: (item) => {
            const found = rawData.find((r) => r.balanceId === item.id);
            return found ? { id: found.balanceId, name: found.name } : undefined;
        },
        onArchiveConfirm: async (recurrence) => {
            const result = await archiveRecurrenceAction({ id: recurrence.id });
            if (!result.success) {
                throw new Error(result.error);
            }
        },
    });

    const onAddClick = () => {
        router.push("/recurrences/create");
    };

    const actionsMenuContext = useMemo<RecurrenceActionContext>(
        () => ({
            onView: (recurrence) => {
                router.push(`/recurrences/${recurrence.balanceId}`);
            },
            onAdjustAmount: (recurrence) => {
                router.push(modalHref(`/recurrences/${recurrence.balanceId}/adjust-amount`));
            },
            onAdjustDeadlines: (recurrence) => {
                router.push(modalHref(`/recurrences/${recurrence.balanceId}/adjust-deadlines`));
            },
            onActivate: (recurrence) => {
                void setActive(recurrence.balanceId, recurrence.name, true);
            },
            onDeactivate: (recurrence) => {
                void setActive(recurrence.balanceId, recurrence.name, false);
            },
            onArchive: (recurrence) => {
                onArchive({ id: recurrence.balanceId, name: recurrence.name });
            },
            onEdit: (recurrence) => {
                router.push(modalHref(`/recurrences/${recurrence.balanceId}/edit`));
            },
        }),
        [router, modalHref, setActive, onArchive]
    );

    return {
        filteredItems,
        actionsMenuContext,
        archiveContext,
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

