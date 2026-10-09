"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/formatters";
import { CommitmentCycleActionContext } from "../../../components/commitment-cycle-actions-drawer";
import { useCommitmentCycleFilters } from "../../../hooks/use-commitment-cycle-filters";
import { useCommitmentCyclesInfinite } from "../../../hooks/use-commitment-cycles-data";
import { useCommitmentsSummaryData } from "../../../hooks/use-commitments-summary-data";
import {
    CommitmentsOverviewInput,
    CommitmentsOverviewMobileProps,
} from "../types";

export function useCommitmentsOverviewMobile({
    contextId,
    title = "Meus Compromissos",
    initialSummary,
    initialCycles,
}: CommitmentsOverviewInput): CommitmentsOverviewMobileProps {
    const router = useRouter();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] =
        useState<boolean>(false);

    const { filters, activeFilterCount, applyFilters, clearFilters } =
        useCommitmentCycleFilters();

    const { summary, isLoadingSummary, summaryError } =
        useCommitmentsSummaryData(filters, contextId, initialSummary);

    const {
        items,
        total,
        hasMore,
        isLoading: isLoadingCycles,
        isLoadingMore,
        error: cyclesError,
        sentinelRef,
    } = useCommitmentCyclesInfinite(filters, contextId, 10, initialCycles);

    const actionContext = useMemo<CommitmentCycleActionContext>(
        () => ({
            onViewDetails: (item) => {
                const query = `from=${encodeURIComponent(item.from)}&to=${encodeURIComponent(item.to)}`;
                if (item.balanceType === "CREDIT") {
                    router.push(`/cards/${item.balanceId}?${query}`);
                } else {
                    router.push(`/commitments/${item.balanceId}?${query}`);
                }
            },
            onSettle: (item) => {
                toast.add({
                    type: "info",
                    title: "Baixa de compromisso",
                    description: `Preparando liquidação de ${item.balanceName} (${formatMoney(item.remainingAmount)})`,
                });
            },
        }),
        [router]
    );

    return {
        title,
        summary,
        isLoadingSummary,
        summaryError,
        items,
        total,
        hasMore,
        isLoadingCycles,
        isLoadingMore,
        cyclesError,
        sentinelRef,
        actionContext,
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
    };
}