"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import type {
    MacroHorizonInfo,
    RecurrenceCycleFilters,
    RecurrenceCyclesResult,
} from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";
import { getRecurrenceCyclesAction } from "@/modules/recurrences/ui/actions/get-recurrence-cycles.action";

export interface UseRecurrenceCyclesDataInput {
    balanceId: number;
    filters: RecurrenceCycleFilters;
    initialData?: RecurrenceCyclesResult | null;
}

export interface UseRecurrenceCyclesDataReturn {
    horizon: MacroHorizonInfo;
    cycles: CycleItem[];
    isLoadingCycles: boolean;
    cyclesError: string | null;
    reloadCycles: () => Promise<void>;
}

const DEFAULT_HORIZON: MacroHorizonInfo = {
    label: "Carregando horizonte...",
    offset: 0,
    canPrev: false,
    canNext: false,
    prevOffset: -1,
    nextOffset: 1,
};

export function useRecurrenceCyclesData({
    balanceId,
    filters,
    initialData,
}: UseRecurrenceCyclesDataInput): UseRecurrenceCyclesDataReturn {
    const isMatchingInitial =
        Boolean(initialData) &&
        initialData?.horizon.offset === filters.offset &&
        filters.status === "ALL" &&
        filters.includeProjected === true &&
        !filters.from &&
        !filters.to &&
        !filters.q;

    const [horizon, setHorizon] = useState<MacroHorizonInfo>(
        isMatchingInitial && initialData ? initialData.horizon : DEFAULT_HORIZON
    );
    const [cycles, setCycles] = useState<CycleItem[]>(
        isMatchingInitial && initialData ? initialData.cycles : []
    );
    const [isLoadingCycles, setIsLoadingCycles] = useState<boolean>(!isMatchingInitial);
    const [cyclesError, setCyclesError] = useState<string | null>(null);

    const prevFilterKeyRef = useRef<string>(
        isMatchingInitial
            ? `${balanceId}_${filters.offset}_${filters.status}_${filters.includeProjected}_${filters.from ?? ""}_${filters.to ?? ""}_${filters.q ?? ""}`
            : ""
    );
    const hasMountedRef = useRef(false);

    // Ciclos novos vindos do servidor (ex.: após um ajuste de prazos/valor): só aplica se
    // forem do horizonte/filtros atuais, sem chamar a action (a URL pode ser a de um modal).
    const [syncedInitial, setSyncedInitial] = useState(initialData);
    if (initialData !== syncedInitial) {
        setSyncedInitial(initialData);
        if (isMatchingInitial && initialData) {
            setHorizon(initialData.horizon);
            setCycles(initialData.cycles);
            setCyclesError(null);
            setIsLoadingCycles(false);
        }
    }

    const fetchCycles = useCallback(async () => {
        setIsLoadingCycles(true);
        setCyclesError(null);

        try {
            const res = await getRecurrenceCyclesAction(balanceId, filters);

            if (!res.success || !res.data) {
                setCyclesError(res.error ?? "Erro ao carregar ciclos da recorrência.");
            } else {
                setHorizon(res.data.horizon);
                setCycles(res.data.cycles);
                setCyclesError(null);
            }
        } catch (error) {
            console.error(
                `[useRecurrenceCyclesData] Erro crítico ao buscar ciclos (${balanceId}):`,
                error
            );
            setCyclesError("Ocorreu um erro ao carregar os ciclos.");
        } finally {
            setIsLoadingCycles(false);
        }
    }, [balanceId, filters]);

    useEffect(() => {
        const currentKey = `${balanceId}_${filters.offset}_${filters.status}_${filters.includeProjected}_${filters.from ?? ""}_${filters.to ?? ""}_${filters.q ?? ""}`;

        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            if (isMatchingInitial) {
                prevFilterKeyRef.current = currentKey;
                return;
            }
        }

        if (prevFilterKeyRef.current !== currentKey) {
            prevFilterKeyRef.current = currentKey;
            void fetchCycles();
        }
    }, [balanceId, filters, isMatchingInitial, fetchCycles]);

    return {
        horizon,
        cycles,
        isLoadingCycles,
        cyclesError,
        reloadCycles: fetchCycles,
    };
}
