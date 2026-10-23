"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ContractCycleFilters, ContractCycleStatusEnum, ContractCycleStatusEnumSchema } from "@/modules/planning/core/schemas/contract-cycle.schema";


export interface UseContractCycleFiltersReturn {
    filters: ContractCycleFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<ContractCycleFilters>) => void;
    clearFilters: () => void;
}

export function useContractCycleFilters(): UseContractCycleFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo<ContractCycleFilters>(() => {
        const q = searchParams.get("q") ?? undefined;
        const rawStatuses = searchParams.get("statuses");
        let statuses: ContractCycleStatusEnum[] | undefined;

        if (rawStatuses) {
            const parsed = rawStatuses
                .split(",")
                .map((s) => s.trim().toUpperCase())
                .filter((s): s is ContractCycleStatusEnum => {
                    return ContractCycleStatusEnumSchema.safeParse(s).success;
                });
            if (parsed.length > 0) {
                statuses = parsed;
            }
        }

        const rawProjected = searchParams.get("includeProjected");
        const includeProjected = rawProjected !== null ? rawProjected !== "false" : true;

        return {
            q,
            statuses,
            includeProjected,
        };
    }, [searchParams]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.q && filters.q.trim().length > 0) count++;
        if (filters.statuses && filters.statuses.length > 0) count += filters.statuses.length;
        if (filters.includeProjected === false) count++;
        return count;
    }, [filters]);

    const applyFilters = useCallback(
        (updates: Partial<ContractCycleFilters>) => {
            const params = new URLSearchParams(searchParams.toString());

            // Sempre reseta paginação ao alterar filtros
            params.delete("page");

            if ("q" in updates) {
                if (updates.q && updates.q.trim().length > 0) {
                    params.set("q", updates.q.trim());
                } else {
                    params.delete("q");
                }
            }

            if ("statuses" in updates) {
                if (updates.statuses && updates.statuses.length > 0) {
                    params.set("statuses", updates.statuses.join(","));
                } else {
                    params.delete("statuses");
                }
            }

            if ("includeProjected" in updates) {
                if (updates.includeProjected === false) {
                    params.set("includeProjected", "false");
                } else {
                    params.delete("includeProjected");
                }
            }

            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("statuses");
        params.delete("includeProjected");
        params.delete("page");
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    return {
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
    };
}
