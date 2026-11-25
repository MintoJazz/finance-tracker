"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useQueryParams } from "@/hooks/use-query-params";
import { useModalHref } from "@/modules/agreements/ui/hooks/use-modal-href";
import { planInstallmentArchive } from "@/modules/installments/application/services/installment-archive.calculator";
import { filterInstallments } from "@/modules/installments/infra/mock/installments.mock";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import { archiveInstallmentAction } from "@/modules/installments/ui/actions/archive-installment.action";
import { useInstallmentFilters } from "@/modules/installments/ui/hooks/use-installment-filters";
import type { InstallmentActionContext } from "../../components/installment-actions-drawer";
import type { ArchiveInstallmentModalProps } from "../archive-installment-modal";

/** Ações fora deste ciclo (ex.: visualização/perfil): apenas avisam que chegam em breve. */
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
    const router = useRouter();
    const modalHref = useModalHref();
    const { getParam, setParam } = useQueryParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSubmittingArchive, setIsSubmittingArchive] = useState(false);

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

    const archiveParam = getParam("archive");
    const archiveTarget = useMemo(() => {
        if (!archiveParam) return null;
        const id = Number(archiveParam);
        if (!Number.isInteger(id) || id <= 0) return null;
        return rawData.find((item) => item.id === id) ?? null;
    }, [archiveParam, rawData]);

    const closeArchive = useCallback(() => {
        setParam("archive", null);
    }, [setParam]);

    const confirmArchive = useCallback(async () => {
        if (!archiveTarget) return;
        setIsSubmittingArchive(true);
        try {
            const result = await archiveInstallmentAction(archiveTarget.id);
            if (!result.success) {
                toast.add({
                    type: "error",
                    title: "Erro ao arquivar parcelamento",
                    description: result.error,
                    priority: "high",
                });
                return;
            }
            toast.add({
                type: "info",
                title: "Arquivamento validado (simulação)",
                description: `"${archiveTarget.description}" pronto para arquivamento no próximo ciclo de backend.`,
            });
            closeArchive();
        } finally {
            setIsSubmittingArchive(false);
        }
    }, [archiveTarget, closeArchive]);

    const archiveContext = useMemo<ArchiveInstallmentModalProps>(() => {
        const plan = archiveTarget
            ? planInstallmentArchive({
                  totalInstallments: archiveTarget.totalInstallments,
                  consolidatedInstallments: archiveTarget.consolidatedInstallments,
                  purchaseDate: archiveTarget.purchaseDate,
              })
            : { keptCount: 0, cancelledCount: 0, newEndsAt: null };

        return {
            isOpen: Boolean(archiveParam && archiveTarget),
            entityName: archiveTarget?.description ?? "",
            keptCount: plan.keptCount,
            cancelledCount: plan.cancelledCount,
            isSubmitting: isSubmittingArchive,
            onConfirm: confirmArchive,
            onClose: closeArchive,
        };
    }, [archiveParam, archiveTarget, isSubmittingArchive, confirmArchive, closeArchive]);

    const onAddClick = () => router.push("/installments/create");

    const actionsMenuContext = useMemo<InstallmentActionContext>(
        () => ({
            onView: (installment) =>
                notifyComingSoon(`Detalhes de ${installment.description}`),
            onEdit: (installment) =>
                router.push(modalHref(`/installments/${installment.id}/edit`)),
            onChangeCategory: (installment) =>
                router.push(
                    modalHref(`/installments/${installment.id}/change-category`)
                ),
            onAdjustValues: (installment) =>
                router.push(
                    modalHref(`/installments/${installment.id}/adjust-values`)
                ),
            onAdjustDeadlines: (installment) =>
                router.push(
                    modalHref(`/installments/${installment.id}/adjust-deadlines`)
                ),
            onChangeCard: (installment) =>
                router.push(
                    modalHref(`/installments/${installment.id}/change-card`)
                ),
            onArchive: (installment) => setParam("archive", String(installment.id)),
        }),
        [router, modalHref, setParam]
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
