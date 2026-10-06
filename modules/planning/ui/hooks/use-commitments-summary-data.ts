"use client";

import { useCallback, useEffect, useState } from "react";
import {
    CommitmentCycleFilters,
    CommitmentsPeriodSummary,
} from "../../core/schemas/commitment-cycle.schema";
import { getCommitmentsSummaryAction } from "../actions/get-commitments-summary.action";

export interface UseCommitmentsSummaryDataReturn {
    summary: CommitmentsPeriodSummary | null;
    isLoadingSummary: boolean;
    summaryError: string | null;
    reloadSummary: () => Promise<void>;
}

export function useCommitmentsSummaryData(
    filters: CommitmentCycleFilters,
    contextId?: number
): UseCommitmentsSummaryDataReturn {
    const [summary, setSummary] = useState<CommitmentsPeriodSummary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        setSummaryError(null);
        try {
            const result = await getCommitmentsSummaryAction({
                contextId,
                filter: filters,
            });
            if (!result.success || !result.data) {
                setSummaryError(
                    result.error ?? "Não foi possível carregar o resumo do período."
                );
                setSummary(null);
            } else {
                setSummary(result.data);
                setSummaryError(null);
            }
        } catch (error) {
            console.error("[useCommitmentsSummaryData] Erro:", error);
            setSummaryError("Erro inesperado ao carregar o resumo do período.");
            setSummary(null);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [contextId, filters]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchSummary();
    }, [fetchSummary]);

    return {
        summary,
        isLoadingSummary,
        summaryError,
        reloadSummary: fetchSummary,
    };
}