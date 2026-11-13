"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { useMovementEntryFilters } from "@/modules/movements/ui/hooks/use-movement-entry-filters";
import { useCycleDetailData } from "../hooks/use-cycle-detail-data";
import { useCycleMovementsPaginated } from "../hooks/use-cycle-movements-paginated";
import { CycleStatementDesktopProps, CycleStatementInput } from "../types";

export function useCycleStatementDesktop<TContext = unknown>({
    balanceId,
    range,
    scope,
    initialDetail,
    initialMovements,
    onNavigateCycle,
    rowActions,
    actionContext,
}: CycleStatementInput<TContext>): CycleStatementDesktopProps<TContext> {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Busca isolada dos detalhes do ciclo
    const {
        cycleDetail,
        isLoadingDetail,
        detailError,
    } = useCycleDetailData({
        balanceId,
        range,
        scope,
        initialData: initialDetail,
    });

    // 2. Filtros sincronizados com a URL
    const {
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
    } = useMovementEntryFilters(scope);

    // 3. Busca das movimentações paginadas
    const {
        data: movementsData,
        isLoading: isLoadingMovements,
        error: movementsError,
        paginationContext,
    } = useCycleMovementsPaginated({
        balanceId,
        range,
        scope,
        filters,
        initialData: initialMovements,
    });

    // 4. Navegação declarativa entre ciclos
    const onNavigate = useCallback(
        (targetRange: CycleRange) => {
            if (onNavigateCycle) {
                onNavigateCycle(targetRange);
            }
            const params = new URLSearchParams(searchParams.toString());
            params.set("from", targetRange.from);
            params.set("to", targetRange.to);
            params.delete("page"); // Reseta para a primeira página no novo ciclo
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [onNavigateCycle, pathname, router, searchParams]
    );

    return {
        cycleDetail,
        isLoadingDetail,
        detailError,
        movementsData,
        isLoadingMovements,
        movementsError,
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
        onNavigate,
        paginationContext,
        scope,
        rowActions,
        actionContext,
    };
}

