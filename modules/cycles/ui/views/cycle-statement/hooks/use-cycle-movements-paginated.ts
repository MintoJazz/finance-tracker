"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Page, PageRequest } from "@/types/pagination.types";
import {
    MovementEntry,
    MovementEntryFilters,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { getCycleMovementEntriesAction } from "@/modules/movements/ui/actions/get-cycle-movement-entries.action";

export interface UseCycleMovementsPaginatedInput {
    balanceId: number;
    range: CycleRange;
    scope?: MovementEntryScope;
    filters: MovementEntryFilters;
    initialData?: Page<MovementEntry> | null;
}

export interface UseCycleMovementsPaginatedReturn {
    data: Page<MovementEntry> | null;
    items: MovementEntry[];
    total: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    reload: () => Promise<void>;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
    sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useCycleMovementsPaginated({
    balanceId,
    range,
    scope = "CONTRACT_CYCLE",
    filters,
    initialData,
}: UseCycleMovementsPaginatedInput): UseCycleMovementsPaginatedReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const rawPage = Number(searchParams.get("page"));
    const rawPageSize = Number(searchParams.get("pageSize"));
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
        !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

    const [data, setData] = useState<Page<MovementEntry> | null>(initialData ?? null);
    const [items, setItems] = useState<MovementEntry[]>(initialData?.data ?? []);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const hasMountedRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const loadData = useCallback(
        async (isAppend = false) => {
            if (isAppend) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            try {
                const pageRequest: PageRequest = { page, pageSize };
                const result = await getCycleMovementEntriesAction({
                    balanceId,
                    range,
                    scope,
                    pageRequest,
                    filter: filters,
                });

                if (!result.success || !result.data) {
                    setError(result.error ?? "Erro ao carregar movimentações.");
                    if (!isAppend) {
                        setData(null);
                        setItems([]);
                    }
                } else {
                    setData(result.data);
                    if (isAppend) {
                        setItems((prev) => [...prev, ...result.data.data]);
                    } else {
                        setItems(result.data.data);
                    }
                    setError(null);
                }
            } catch (err) {
                console.error("[useCycleMovementsPaginated] Erro crítico:", err);
                setError("Erro inesperado ao carregar movimentações.");
                if (!isAppend) {
                    setData(null);
                    setItems([]);
                }
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [balanceId, range, scope, page, pageSize, filters]
    );

    const hasActiveFilters = Boolean(
        filters.q ||
        filters.direction ||
        (filters.types && filters.types.length > 0) ||
        filters.includeReversed
    );

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            if (initialData && page === 1 && !hasActiveFilters) {
                return;
            }
        }
        void loadData(page > 1);
    }, [loadData, initialData, page, hasActiveFilters]);

    const setPage = useCallback(
        (pageIndex: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(pageIndex + 1));
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const setPageSize = useCallback(
        (size: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("pageSize", String(size));
            params.delete("page");
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const total = data?.total ?? items.length;
    const hasMore = Boolean(data && page < data.pageCount);

    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            if (!node || !hasMore || isLoading || isLoadingMore) return;

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
                    setPage(page);
                }
            });

            observerRef.current.observe(node);
        },
        [hasMore, isLoading, isLoadingMore, page, setPage]
    );

    return {
        data,
        items,
        total,
        hasMore,
        isLoading,
        isLoadingMore,
        error,
        reload: () => loadData(false),
        paginationContext: {
            setPage,
            setPageSize,
        },
        sentinelRef,
    };
}
