"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/formatters";
import { CommitmentCycleActionContext } from "../../../components/commitment-cycle-actions-drawer";
import { useCommitmentCycleFilters } from "../../../hooks/use-commitment-cycle-filters";
import { useCommitmentCyclesPaginated } from "../../../hooks/use-commitment-cycles-data";
import { useCommitmentsSummaryData } from "../../../hooks/use-commitments-summary-data";
import {
    CommitmentsOverviewDesktopProps,
    CommitmentsOverviewInput,
} from "../types";

export function useCommitmentsOverviewDesktop({
    contextId,
    title = "Meus Compromissos",
    initialSummary,
    initialCycles,
}: CommitmentsOverviewInput): CommitmentsOverviewDesktopProps {
    const router = useRouter();

    const { filters, activeFilterCount, applyFilters, clearFilters } =
        useCommitmentCycleFilters();

    const { summary, isLoadingSummary, summaryError } =
        useCommitmentsSummaryData(filters, contextId, initialSummary);

    const {
        data: cyclesData,
        isLoading: isLoadingCycles,
        error: cyclesError,
        paginationContext,
    } = useCommitmentCyclesPaginated(filters, contextId, initialCycles);

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
        cyclesData,
        isLoadingCycles,
        cyclesError,
        actionContext,
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
        paginationContext,
    };
}