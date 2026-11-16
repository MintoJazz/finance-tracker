"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterBadgeOption } from "@/components/filter-badges-carousel";
import {
    RecurrenceDirectionSchema,
    RecurrenceFilters,
    RecurrenceFrequencySchema,
    RecurrenceStatusSchema,
} from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    RECURRENCE_DIRECTION_FILTER_THEMES,
    RECURRENCE_FREQUENCY_LABELS,
    RECURRENCE_STATUS_FILTER_THEMES,
} from "@/modules/recurrences/ui/themes/recurrence.themes";
import { ArrowUpDown, CircleDashed, ListChecks, Repeat } from "lucide-react";

export type RecurrenceFilterBadgeKey = "direction" | "active" | "frequency";

export interface UseRecurrenceFiltersReturn {
    filters: RecurrenceFilters;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<RecurrenceFilterBadgeKey>[];
    applyFilters: (newFilters: Partial<RecurrenceFilters>) => void;
    clearFilters: () => void;
    clearAllFilters: () => void;
}

/**
 * Sincroniza os filtros da tela de recorrências com a URL e gera badges removíveis para o carrossel.
 */
export function useRecurrenceFilters(): UseRecurrenceFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo<RecurrenceFilters>(() => {
        const q = searchParams.get("q")?.trim() || undefined;

        const parsedDirection = RecurrenceDirectionSchema.safeParse(
            searchParams.get("direction")
        );
        const direction = parsedDirection.success
            ? parsedDirection.data
            : undefined;

        const parsedActive = RecurrenceStatusSchema.safeParse(
            searchParams.get("active")
        );
        const active = parsedActive.success ? parsedActive.data : "ALL";

        const parsedFrequency = RecurrenceFrequencySchema.safeParse(
            searchParams.get("frequency")
        );
        const frequency = parsedFrequency.success
            ? parsedFrequency.data
            : undefined;

        return {
            q,
            direction,
            active,
            frequency,
        };
    }, [searchParams]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.direction) count++;
        if (filters.active && filters.active !== "ALL") count++;
        if (filters.frequency) count++;
        return count;
    }, [filters.direction, filters.active, filters.frequency]);

    const hasAnyFilter = useMemo(
        () => Boolean(filters.q && filters.q.trim().length > 0) || activeFilterCount > 0,
        [filters.q, activeFilterCount]
    );

    const applyFilters = useCallback(
        (newFilters: Partial<RecurrenceFilters>) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("page");

            if ("q" in newFilters) {
                if (newFilters.q && newFilters.q.trim().length > 0) {
                    params.set("q", newFilters.q.trim());
                } else {
                    params.delete("q");
                }
            }

            if ("direction" in newFilters) {
                if (newFilters.direction) {
                    params.set("direction", newFilters.direction);
                } else {
                    params.delete("direction");
                }
            }

            if ("active" in newFilters) {
                if (newFilters.active && newFilters.active !== "ALL") {
                    params.set("active", newFilters.active);
                } else {
                    params.delete("active");
                }
            }

            if ("frequency" in newFilters) {
                if (newFilters.frequency) {
                    params.set("frequency", newFilters.frequency);
                } else {
                    params.delete("frequency");
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
        params.delete("direction");
        params.delete("active");
        params.delete("frequency");
        params.delete("page");

        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
    }, [pathname, router, searchParams]);

    const clearAllFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("direction");
        params.delete("active");
        params.delete("frequency");
        params.delete("page");

        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
    }, [pathname, router, searchParams]);

    const activeFilterBadges = useMemo<
        FilterBadgeOption<RecurrenceFilterBadgeKey>[]
    >(() => {
        const badges: FilterBadgeOption<RecurrenceFilterBadgeKey>[] = [];

        if (filters.direction) {
            badges.push({
                key: "direction",
                // prefix: "Direção:",
                icon: ArrowUpDown,
                label: RECURRENCE_DIRECTION_FILTER_THEMES[filters.direction]
                    .label,
                onRemove: () => applyFilters({ direction: undefined }),
            });
        }

        if (filters.active && filters.active !== "ALL") {
            badges.push({
                key: "active",
                // prefix: "Status:",
                icon: CircleDashed,
                label: RECURRENCE_STATUS_FILTER_THEMES[filters.active].label,
                onRemove: () => applyFilters({ active: "ALL" }),
            });
        }

        if (filters.frequency) {
            badges.push({
                key: "frequency",
                // prefix: "Frequência:",
                icon: Repeat,
                label: RECURRENCE_FREQUENCY_LABELS[filters.frequency],
                onRemove: () => applyFilters({ frequency: undefined }),
            });
        }

        return badges;
    }, [filters.direction, filters.active, filters.frequency, applyFilters]);

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
