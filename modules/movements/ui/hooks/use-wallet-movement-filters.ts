"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { WalletMovementFilters, WalletMovementType } from "@/modules/movements/models/wallet-movement.schema";

import {
    MovementEntryType,
    MovementEntryTypeSchema,
} from "@/modules/movements/models/movement-entry.schema";

export interface UseWalletMovementFiltersReturn {
    filters: WalletMovementFilters;
    activeFilterCount: number;
    applyFilters: (newFilters: Partial<WalletMovementFilters>) => void;
    clearFilters: () => void;
}

const VALID_TYPES = new Set<string>(MovementEntryTypeSchema.options);

export function useWalletMovementFilters(): UseWalletMovementFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo<WalletMovementFilters>(() => {
        const q = searchParams.get("q") || undefined;
        const from = searchParams.get("from") || undefined;
        const to = searchParams.get("to") || undefined;

        const rawDirection = searchParams.get("direction");
        const direction =
            rawDirection === "CREDIT" || rawDirection === "DEBIT" ? rawDirection : undefined;

        const rawTypes = searchParams.get("types");
        const types = rawTypes
            ? (rawTypes
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => VALID_TYPES.has(t as WalletMovementType)) as WalletMovementType[])
            : undefined;

        const rawIncludeReversed = searchParams.get("includeReversed");
        const includeReversed = rawIncludeReversed === "true" ? true : undefined;

        return {
            q,
            from,
            to,
            direction,
            types: types && types.length > 0 ? types : undefined,
            includeReversed,
        };
    }, [searchParams]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.q && filters.q.trim().length > 0) count++;
        if (filters.from) count++;
        if (filters.to) count++;
        if (filters.direction) count++;
        if (filters.types && filters.types.length > 0) count += filters.types.length;
        if (filters.includeReversed) count++;
        return count;
    }, [filters]);

    const applyFilters = useCallback(
        (newFilters: Partial<WalletMovementFilters>) => {
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

            if ("from" in newFilters) {
                if (newFilters.from) params.set("from", newFilters.from);
                else params.delete("from");
            }

            if ("to" in newFilters) {
                if (newFilters.to) params.set("to", newFilters.to);
                else params.delete("to");
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
        params.delete("from");
        params.delete("to");
        params.delete("direction");
        params.delete("types");
        params.delete("includeReversed");
        params.delete("page");

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
