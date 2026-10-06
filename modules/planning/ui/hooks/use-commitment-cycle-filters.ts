"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    CommitmentCycleFilters,
    CommitmentCycleStatusEnum,
    CommitmentCycleStatusEnumSchema,
    CommitmentSourceTypeEnum,
    CommitmentSourceTypeEnumSchema,
} from "../../core/schemas/commitment-cycle.schema";

export type PeriodPresetKey = "current_month" | "next_30_days" | "next_3_months";

function toIsoDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function getPeriodPresetRange(preset: PeriodPresetKey): {
    from: string;
    to: string;
} {
    const now = new Date();

    if (preset === "next_30_days") {
        const end = new Date(now);
        end.setDate(end.getDate() + 30);
        return { from: toIsoDateStr(now), to: toIsoDateStr(end) };
    }

    if (preset === "next_3_months") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
        return { from: toIsoDateStr(start), to: toIsoDateStr(end) };
    }

    // Default: current_month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toIsoDateStr(firstDay), to: toIsoDateStr(lastDay) };
}

export interface UseCommitmentCycleFiltersReturn {
    filters: CommitmentCycleFilters;
    activeFilterCount: number;
    applyFilters: (updates: Partial<CommitmentCycleFilters>) => void;
    clearFilters: () => void;
}

export function useCommitmentCycleFilters(): UseCommitmentCycleFiltersReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const defaultRange = useMemo(() => getPeriodPresetRange("current_month"), []);

    const filters = useMemo<CommitmentCycleFilters>(() => {
        const q = searchParams.get("q") || undefined;
        const from = searchParams.get("from") || defaultRange.from;
        const to = searchParams.get("to") || defaultRange.to;

        const rawTypes = searchParams.get("sourceTypes");
        let balanceTypes: CommitmentSourceTypeEnum[] | undefined = undefined;
        if (rawTypes) {
            const valid = rawTypes
                .split(",")
                .map((t) => t.trim())
                .filter(
                    (t): t is CommitmentSourceTypeEnum =>
                        CommitmentSourceTypeEnumSchema.safeParse(t).success
                );
            if (valid.length > 0) balanceTypes = valid;
        }

        const rawStatuses = searchParams.get("statuses");
        let statuses: CommitmentCycleStatusEnum[] | undefined = undefined;
        if (rawStatuses) {
            const valid = rawStatuses
                .split(",")
                .map((s) => s.trim())
                .filter(
                    (s): s is CommitmentCycleStatusEnum =>
                        CommitmentCycleStatusEnumSchema.safeParse(s).success
                );
            if (valid.length > 0) statuses = valid;
        }

        return {
            from,
            to,
            q,
            balanceTypes,
            statuses,
        };
    }, [searchParams, defaultRange]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.q && filters.q.trim().length > 0) count++;
        if (
            filters.from !== defaultRange.from ||
            filters.to !== defaultRange.to
        ) {
            count++;
        }
        if (filters.balanceTypes && filters.balanceTypes.length > 0) {
            count += filters.balanceTypes.length;
        }
        if (filters.statuses && filters.statuses.length > 0) {
            count += filters.statuses.length;
        }
        return count;
    }, [filters, defaultRange]);

    const applyFilters = useCallback(
        (updates: Partial<CommitmentCycleFilters>) => {
            const params = new URLSearchParams(searchParams.toString());
            const merged: CommitmentCycleFilters = { ...filters, ...updates };

            if (merged.q && merged.q.trim().length > 0) {
                params.set("q", merged.q.trim());
            } else {
                params.delete("q");
            }

            if (merged.from) {
                params.set("from", merged.from);
            } else {
                params.delete("from");
            }

            if (merged.to) {
                params.set("to", merged.to);
            } else {
                params.delete("to");
            }

            if (merged.balanceTypes && merged.balanceTypes.length > 0) {
                params.set("sourceTypes", merged.balanceTypes.join(","));
            } else {
                params.delete("sourceTypes");
            }

            if (merged.statuses && merged.statuses.length > 0) {
                params.set("statuses", merged.statuses.join(","));
            } else {
                params.delete("statuses");
            }

            params.set("page", "1");

            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, {
                scroll: false,
            });
        },
        [filters, pathname, router, searchParams]
    );

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("from");
        params.delete("to");
        params.delete("sourceTypes");
        params.delete("statuses");
        params.set("page", "1");

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