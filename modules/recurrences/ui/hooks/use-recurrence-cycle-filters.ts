"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, CircleDashed, EyeOff } from "lucide-react";
import { addDays, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { FilterBadgeOption } from "@/components/filter-badges-carousel";
import { formatDate } from "@/lib/formatters";
import {
    MacroHorizonInfo,
    RecurrenceCycleFilters,
    RecurrenceCycleStatusFilter,
    RecurrenceCycleStatusFilterSchema,
} from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

export type RecurrenceCycleFilterBadgeKey = "status" | "includeProjected" | "period";

const STATUS_LABELS: Record<RecurrenceCycleStatusFilter, string> = {
    ALL: "Todos",
    PENDING: "Pendentes",
    PAID: "Pagos",
    OVERDUE: "Atrasados",
};

export interface UseRecurrenceCycleFiltersReturn {
    filters: RecurrenceCycleFilters;
    activeFilterCount: number;
    hasAnyFilter: boolean;
    activeFilterBadges: FilterBadgeOption<RecurrenceCycleFilterBadgeKey>[];
    dateRange: DateRange | undefined;
    applyFilters: (newFilters: Partial<RecurrenceCycleFilters>) => void;
    onSelectDateRange: (range: DateRange | undefined) => void;
    onResetDateRange: () => void;
    onNavigateOffset: (targetOffset: number) => void;
    onPrevHorizon: (horizon: MacroHorizonInfo) => void;
    onNextHorizon: (horizon: MacroHorizonInfo) => void;
    clearFilters: () => void;
}

export function useRecurrenceCycleFilters(): UseRecurrenceCycleFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo<RecurrenceCycleFilters>(() => {
        const rawOffset = searchParams.get("offset");
        const parsedOffset = rawOffset !== null ? parseInt(rawOffset, 10) : 0;
        const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;

        const parsedStatus = RecurrenceCycleStatusFilterSchema.safeParse(
            searchParams.get("status")
        );
        const status = parsedStatus.success ? parsedStatus.data : "ALL";

        const rawProjected = searchParams.get("includeProjected");
        const includeProjected = rawProjected === "false" ? false : true;

        const from = searchParams.get("from") || undefined;
        const to = searchParams.get("to") || undefined;

        return {
            offset,
            status,
            includeProjected,
            from,
            to,
        };
    }, [searchParams]);

    const dateRange = useMemo<DateRange | undefined>(() => {
        if (!filters.from) return undefined;
        const fromDate = parseISO(filters.from);
        if (Number.isNaN(fromDate.getTime())) return undefined;
        const toDate = filters.to ? parseISO(filters.to) : undefined;
        return {
            from: fromDate,
            to: toDate && !Number.isNaN(toDate.getTime()) ? toDate : undefined,
        };
    }, [filters.from, filters.to]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status && filters.status !== "ALL") count++;
        if (!filters.includeProjected) count++;
        if (filters.from && filters.to) count++;
        return count;
    }, [filters.status, filters.includeProjected, filters.from, filters.to]);

    const hasAnyFilter = useMemo(
        () => activeFilterCount > 0,
        [activeFilterCount]
    );

    const applyFilters = useCallback(
        (newFilters: Partial<RecurrenceCycleFilters>) => {
            const params = new URLSearchParams(searchParams.toString());

            if ("status" in newFilters) {
                if (newFilters.status && newFilters.status !== "ALL") {
                    params.set("status", newFilters.status);
                } else {
                    params.delete("status");
                }
            }

            if ("includeProjected" in newFilters) {
                if (newFilters.includeProjected === false) {
                    params.set("includeProjected", "false");
                } else {
                    params.delete("includeProjected");
                }
            }

            if ("offset" in newFilters) {
                if (newFilters.offset !== undefined && newFilters.offset !== 0) {
                    params.set("offset", String(newFilters.offset));
                } else {
                    params.delete("offset");
                }
            }

            if ("from" in newFilters) {
                if (newFilters.from) {
                    params.set("from", newFilters.from);
                } else {
                    params.delete("from");
                }
            }

            if ("to" in newFilters) {
                if (newFilters.to) {
                    params.set("to", newFilters.to);
                } else {
                    params.delete("to");
                }
            }

            // Remove q caso exista em deep links legados
            if (params.has("q")) {
                params.delete("q");
            }

            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const onSelectDateRange = useCallback(
        (range: DateRange | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (range?.from && range?.to) {
                params.set("from", format(range.from, "yyyy-MM-dd"));
                params.set("to", format(range.to, "yyyy-MM-dd"));
                params.delete("offset");
            } else {
                params.delete("from");
                params.delete("to");
            }
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const onResetDateRange = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("from");
        params.delete("to");
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    const onNavigateOffset = useCallback(
        (targetOffset: number) => {
            const params = new URLSearchParams(searchParams.toString());
            if (targetOffset !== 0) {
                params.set("offset", String(targetOffset));
            } else {
                params.delete("offset");
            }
            params.delete("from");
            params.delete("to");
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const onPrevHorizon = useCallback(
        (horizon: MacroHorizonInfo) => {
            if (horizon.isCustom && filters.from && filters.to) {
                const fromDate = parseISO(filters.from);
                const toDate = parseISO(filters.to);
                const diffDays = Math.max(1, differenceInCalendarDays(toDate, fromDate) + 1);
                const newFrom = subDays(fromDate, diffDays);
                const newTo = subDays(toDate, diffDays);
                const params = new URLSearchParams(searchParams.toString());
                params.set("from", format(newFrom, "yyyy-MM-dd"));
                params.set("to", format(newTo, "yyyy-MM-dd"));
                params.delete("offset");
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
            } else {
                onNavigateOffset(horizon.prevOffset);
            }
        },
        [filters.from, filters.to, onNavigateOffset, pathname, router, searchParams]
    );

    const onNextHorizon = useCallback(
        (horizon: MacroHorizonInfo) => {
            if (horizon.isCustom && filters.from && filters.to) {
                const fromDate = parseISO(filters.from);
                const toDate = parseISO(filters.to);
                const diffDays = Math.max(1, differenceInCalendarDays(toDate, fromDate) + 1);
                const newFrom = addDays(fromDate, diffDays);
                const newTo = addDays(toDate, diffDays);
                const params = new URLSearchParams(searchParams.toString());
                params.set("from", format(newFrom, "yyyy-MM-dd"));
                params.set("to", format(newTo, "yyyy-MM-dd"));
                params.delete("offset");
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
            } else {
                onNavigateOffset(horizon.nextOffset);
            }
        },
        [filters.from, filters.to, onNavigateOffset, pathname, router, searchParams]
    );

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("status");
        params.delete("includeProjected");
        params.delete("from");
        params.delete("to");

        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    const activeFilterBadges = useMemo<
        FilterBadgeOption<RecurrenceCycleFilterBadgeKey>[]
    >(() => {
        const badges: FilterBadgeOption<RecurrenceCycleFilterBadgeKey>[] = [];

        if (filters.from && filters.to) {
            badges.push({
                key: "period",
                icon: Calendar,
                label: `${formatDate(filters.from)} – ${formatDate(filters.to)}`,
                onRemove: onResetDateRange,
            });
        }

        if (filters.status && filters.status !== "ALL") {
            badges.push({
                key: "status",
                icon: CircleDashed,
                label: STATUS_LABELS[filters.status],
                onRemove: () => applyFilters({ status: "ALL" }),
            });
        }

        if (!filters.includeProjected) {
            badges.push({
                key: "includeProjected",
                icon: EyeOff,
                label: "Sem projetadas",
                onRemove: () => applyFilters({ includeProjected: true }),
            });
        }

        return badges;
    }, [filters.from, filters.to, filters.status, filters.includeProjected, onResetDateRange, applyFilters]);

    return {
        filters,
        activeFilterCount,
        hasAnyFilter,
        activeFilterBadges,
        dateRange,
        applyFilters,
        onSelectDateRange,
        onResetDateRange,
        onNavigateOffset,
        onPrevHorizon,
        onNextHorizon,
        clearFilters,
    };
}
