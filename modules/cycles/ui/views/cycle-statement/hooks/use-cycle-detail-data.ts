"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CycleDetail } from "@/modules/cycles/models/cycle-detail.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { MovementEntryScope } from "@/modules/movements/models/movement-entry.schema";
import { getCycleDetailAction } from "@/modules/cycles/ui/actions/get-cycle-detail.action";

export interface UseCycleDetailDataInput {
    balanceId: number;
    range?: CycleRange;
    scope?: MovementEntryScope;
    initialData?: CycleDetail | null;
}

export interface UseCycleDetailDataReturn {
    cycleDetail: CycleDetail | null;
    isLoadingDetail: boolean;
    detailError: string | null;
    reloadDetail: () => Promise<void>;
}

export function useCycleDetailData({
    balanceId,
    range,
    scope = "CARD",
    initialData,
}: UseCycleDetailDataInput): UseCycleDetailDataReturn {
    const isMatchingInitial =
        initialData?.balanceId === balanceId &&
        (!range?.from || initialData.from === range.from) &&
        (!range?.to || initialData.to === range.to);

    const [cycleDetail, setCycleDetail] = useState<CycleDetail | null>(
        isMatchingInitial ? initialData : null
    );
    const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(!isMatchingInitial);
    const [detailError, setDetailError] = useState<string | null>(null);

    const prevRangeKeyRef = useRef<string>(
        isMatchingInitial ? `${balanceId}_${range?.from ?? ""}_${range?.to ?? ""}` : ""
    );
    const hasMountedRef = useRef(false);

    // Detalhe novo vindo do servidor (ex.: após ajustar prazos): aplica sem chamar a action.
    const [syncedInitial, setSyncedInitial] = useState(initialData);
    if (initialData !== syncedInitial) {
        setSyncedInitial(initialData);
        if (isMatchingInitial && initialData) {
            setCycleDetail(initialData);
            setDetailError(null);
            setIsLoadingDetail(false);
        }
    }

    const fetchDetail = useCallback(async () => {
        setIsLoadingDetail(true);
        setDetailError(null);

        try {
            const res = await getCycleDetailAction({
                balanceId,
                range: range?.from && range?.to ? range : undefined,
                scope,
            });

            if (!res.success || !res.data) {
                setDetailError(res.error ?? "Erro ao carregar detalhes do ciclo.");
                setCycleDetail(null);
            } else {
                setCycleDetail(res.data);
                setDetailError(null);
            }
        } catch (error) {
            console.error("[useCycleDetailData] Erro crítico ao buscar ciclo:", error);
            setDetailError("Erro inesperado ao carregar detalhes do ciclo.");
            setCycleDetail(null);
        } finally {
            setIsLoadingDetail(false);
        }
    }, [balanceId, range, scope]);

    useEffect(() => {
        const currentKey = `${balanceId}_${range?.from ?? ""}_${range?.to ?? ""}`;

        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            if (isMatchingInitial) {
                prevRangeKeyRef.current = currentKey;
                return;
            }
        }

        // SÓ recarrega se balanceId, from ou to mudaram
        if (prevRangeKeyRef.current !== currentKey) {
            prevRangeKeyRef.current = currentKey;
            void fetchDetail();
        }
    }, [balanceId, range?.from, range?.to, isMatchingInitial, fetchDetail]);

    return {
        cycleDetail,
        isLoadingDetail,
        detailError,
        reloadDetail: fetchDetail,
    };
}
