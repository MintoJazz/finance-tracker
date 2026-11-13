"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    MovementEntryDirection,
    MovementEntryFilters,
    MovementEntryScope,
    MovementEntryType,
} from "@/modules/movements/models/movement-entry.schema";
import { MovementEntryFilterPrismaRegistry } from "@/modules/movements/infra/registries/movement-entry-filter-prisma.registry";

export interface UseMovementEntryFiltersReturn {
    filters: MovementEntryFilters;
    activeFilterCount: number;
    applyFilters: (newFilters: Partial<MovementEntryFilters>) => void;
    clearFilters: () => void;
}

export function useMovementEntryFilters(
    scope: MovementEntryScope = "CARD"
): UseMovementEntryFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const allowedTypes = useMemo(
        () => new Set<string>(MovementEntryFilterPrismaRegistry.getAllowedTypes(scope)),
        [scope]
    );

    const filters = useMemo<MovementEntryFilters>(() => {
        const q = searchParams.get("q")?.trim() || undefined;
        const from = searchParams.get("from") || undefined;
        const to = searchParams.get("to") || undefined;

        const rawDirection = searchParams.get("direction");
        const direction =
            rawDirection === "CREDIT" || rawDirection === "DEBIT"
                ? (rawDirection as MovementEntryDirection)
                : undefined;

        const rawTypes = searchParams.get("types");
        const types = rawTypes
            ? (rawTypes
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => allowedTypes.has(t)) as MovementEntryType[])
            : undefined;

        const rawIncludeReversed = searchParams.get("includeReversed");
        const includeReversed = rawIncludeReversed === "true";

        return {
            q,
            from,
            to,
            direction,
            types: types && types.length > 0 ? types : undefined,
            includeReversed,
        };
    }, [searchParams, allowedTypes]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.q && filters.q.trim().length > 0) count++;
        if (filters.direction) count++;
        if (filters.types && filters.types.length > 0) count += filters.types.length;
        if (filters.includeReversed) count++;
        return count;
    }, [filters]);

    const applyFilters = useCallback(
        (newFilters: Partial<MovementEntryFilters>) => {
            const params = new URLSearchParams(searchParams.toString());

            // Sempre reseta para a página 1 ao alterar filtros
            params.delete("page");

            if ("q" in newFilters) {
                if (newFilters.q && newFilters.q.trim().length > 0) {
                    params.set("q", newFilters.q.trim());
                } else {
                    params.delete("q");
                }
            }

            if ("direction" in newFilters) {
                if (newFilters.direction) params.set("direction", newFilters.direction);
                else params.delete("direction");
            }

            if ("types" in newFilters) {
                if (newFilters.types && newFilters.types.length > 0) {
                    params.set("types", newFilters.types.join(","));
                } else {
                    params.delete("types");
                }
            }

            if ("includeReversed" in newFilters) {
                if (newFilters.includeReversed) {
                    params.set("includeReversed", "true");
                } else {
                    params.delete("includeReversed");
                }
            }

            // Nota: from e to não são alterados via applyFilters, pois pertencem à navegação do ciclo
            const queryString = params.toString();
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
                scroll: false,
            });
        },
        [pathname, router, searchParams]
    );

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("direction");
        params.delete("types");
        params.delete("includeReversed");
        params.delete("page");

        // PRESERVA from e to para não perder o ciclo ativo
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
    }, [pathname, router, searchParams]);

    return {
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
    };
}

