"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleDashed, CreditCard } from "lucide-react";
import type { FilterBadgeOption } from "@/components/filter-badges-carousel";
import {
    InstallmentStatusSchema,
    InstallmentTypeSchema,
    type InstallmentFilters,
} from "@/modules/installments/models/schemas/installment-item.schema";
import {
    INSTALLMENT_STATUS_FILTER_THEMES,
    INSTALLMENT_TYPE_LABELS,
} from "@/modules/installments/ui/themes/installment.themes";

export type InstallmentFilterBadgeKey = "status" | "type";

export interface UseInstallmentFiltersReturn {
    filters: InstallmentFilters;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<InstallmentFilterBadgeKey>[];
    applyFilters: (newFilters: Partial<InstallmentFilters>) => void;
    clearFilters: () => void;
    clearAllFilters: () => void;
}

/**
 * Sincroniza os filtros da tela de parcelamentos com a URL e gera badges removíveis para o carrossel.
 */
export function useInstallmentFilters(): UseInstallmentFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo<InstallmentFilters>(() => {
        const q = searchParams.get("q")?.trim() || undefined;

        const parsedStatus = InstallmentStatusSchema.safeParse(
            searchParams.get("status")
        );
        const status = parsedStatus.success ? parsedStatus.data : "ALL";

        const parsedType = InstallmentTypeSchema.safeParse(
            searchParams.get("type")
        );
        const type = parsedType.success ? parsedType.data : undefined;

        return { q, status, type };
    }, [searchParams]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status !== "ALL") count++;
        if (filters.type) count++;
        return count;
    }, [filters.status, filters.type]);

    const hasAnyFilter = useMemo(
        () => Boolean(filters.q) || activeFilterCount > 0,
        [filters.q, activeFilterCount]
    );

    const replaceParams = useCallback(
        (params: URLSearchParams) => {
            const queryString = params.toString();
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
                scroll: false,
            });
        },
        [pathname, router]
    );

    const applyFilters = useCallback(
        (newFilters: Partial<InstallmentFilters>) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("page");

            if ("q" in newFilters) {
                if (newFilters.q && newFilters.q.trim().length > 0) {
                    params.set("q", newFilters.q.trim());
                } else {
                    params.delete("q");
                }
            }

            if ("status" in newFilters) {
                if (newFilters.status && newFilters.status !== "ALL") {
                    params.set("status", newFilters.status);
                } else {
                    params.delete("status");
                }
            }

            if ("type" in newFilters) {
                if (newFilters.type) {
                    params.set("type", newFilters.type);
                } else {
                    params.delete("type");
                }
            }

            replaceParams(params);
        },
        [replaceParams, searchParams]
    );

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("status");
        params.delete("type");
        params.delete("page");
        replaceParams(params);
    }, [replaceParams, searchParams]);

    const clearAllFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("status");
        params.delete("type");
        params.delete("page");
        replaceParams(params);
    }, [replaceParams, searchParams]);

    const activeFilterBadges = useMemo<
        FilterBadgeOption<InstallmentFilterBadgeKey>[]
    >(() => {
        const badges: FilterBadgeOption<InstallmentFilterBadgeKey>[] = [];

        if (filters.status !== "ALL") {
            badges.push({
                key: "status",
                icon: CircleDashed,
                label: INSTALLMENT_STATUS_FILTER_THEMES[filters.status].label,
                onRemove: () => applyFilters({ status: "ALL" }),
            });
        }

        if (filters.type) {
            badges.push({
                key: "type",
                icon: CreditCard,
                label: INSTALLMENT_TYPE_LABELS[filters.type],
                onRemove: () => applyFilters({ type: undefined }),
            });
        }

        return badges;
    }, [filters.status, filters.type, applyFilters]);

    return {
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        applyFilters,
        clearFilters,
        clearAllFilters,
    };
}
