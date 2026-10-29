"use client";

import * as React from "react";
import { useBreadcrumbLabel } from "@/components/header/context";
import {
    ContractCycleProfile,
    CycleEntryRow,
} from "@/modules/cycles/models/contract-cycle.schema";
import { ContractCycleProfileInput } from "../types";

export function useContractCycleProfileData(input: ContractCycleProfileInput) {
    const { cycle, entries, isLoading, error } = input;

    // Atualiza breadcrumb hierárquico
    useBreadcrumbLabel("contractProfile", cycle?.contractName);
    useBreadcrumbLabel("contractCycle", cycle?.title);

    const handleSkip = React.useCallback(
        (targetCycle: ContractCycleProfile) => {
            console.log("[useContractCycleProfileData] Solicitado cancelamento da previsão do ciclo:", targetCycle.title);
        },
        []
    );

    const handleViewEntry = React.useCallback((entry: CycleEntryRow) => {
        console.log("[useContractCycleProfileData] Visualizar lançamento:", entry);
    }, []);

    const handleReverseEntry = React.useCallback((entry: CycleEntryRow) => {
        console.log("[useContractCycleProfileData] Estornar lançamento:", entry);
    }, []);

    return {
        cycle,
        entries: entries ?? [],
        isLoading: Boolean(isLoading),
        error: error ?? null,
        onSkip: handleSkip,
        onViewEntry: handleViewEntry,
        onReverseEntry: handleReverseEntry,
    };
}
