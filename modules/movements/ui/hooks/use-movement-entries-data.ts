"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Page, PageRequest } from "@/types/pagination.types";
import { Result } from "@/types/result.types";
import {
    MovementEntry,
    MovementEntryFilters,
} from "@/modules/movements/models/movement-entry.schema";

export type MovementEntriesFetcher = (params: {
    pageRequest: PageRequest;
    filter?: MovementEntryFilters;
}) => Promise<Result<Page<MovementEntry>>>;

export interface UseMovementEntriesPaginatedOptions {
    fetcher: MovementEntriesFetcher;
    filters: MovementEntryFilters;
    initialData?: Page<MovementEntry> | null;
}

export interface UseMovementEntriesPaginatedReturn {
    data: Page<MovementEntry> | null;
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
}

export function useMovementEntriesPaginated({
    fetcher,
    filters,
    initialData,
}: UseMovementEntriesPaginatedOptions): UseMovementEntriesPaginatedReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const rawPage = Number(searchParams.get("page"));
    const rawPageSize = Number(searchParams.get("pageSize"));
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
        !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

    const [data, setData] = useState<Page<MovementEntry> | null>(initialData ?? null);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<string | null>(null);
    const hasMountedRef = useRef(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const pageRequest: PageRequest = { page, pageSize };
            const result = await fetcher({
                pageRequest,
                filter: filters,
            });

            if (!result.success || !result.data) {
                setError(result.error ?? "Erro ao carregar movimentações.");
                setData(null);
            } else {
                setData(result.data);
                setError(null);
            }
        } catch (err) {
            console.error("[useMovementEntriesPaginated] Erro crítico:", err);
            setError("Erro inesperado ao carregar movimentações.");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, page, pageSize, filters]);

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
        void loadData();
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
            params.set("page", "1");
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    return {
        data,
        isLoading,
        error,
        reload: loadData,
        paginationContext: {
            setPage,
            setPageSize,
        },
    };
}

export interface UseMovementEntriesInfiniteOptions {
    fetcher: MovementEntriesFetcher;
    filters: MovementEntryFilters;
    pageSize?: number;
    initialData?: Page<MovementEntry> | null;
}

export interface UseMovementEntriesInfiniteReturn {
    items: MovementEntry[];
    total: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    reload: () => Promise<void>;
    loadMore: () => Promise<void>;
    sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useMovementEntriesInfinite({
    fetcher,
    filters,
    pageSize = 10,
    initialData,
}: UseMovementEntriesInfiniteOptions): UseMovementEntriesInfiniteReturn {
    const [items, setItems] = useState<MovementEntry[]>(initialData?.data ?? []);
    const [pageIndex, setPageIndex] = useState<number>(initialData?.pageIndex ?? 0);
    const [pageCount, setPageCount] = useState<number>(initialData?.pageCount ?? 1);
    const [total, setTotal] = useState<number>(initialData?.total ?? 0);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const hasMountedRef = useRef(false);

    const hasMore = pageIndex < pageCount - 1 && items.length < total;

    const loadInitial = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetcher({
                pageRequest: { page: 1, pageSize },
                filter: filters,
            });
            if (!result.success || !result.data) {
                setError(result.error ?? "Erro ao carregar lançamentos.");
                setItems([]);
                setTotal(0);
                setPageIndex(0);
                setPageCount(1);
            } else {
                setItems(result.data.data);
                setTotal(result.data.total);
                setPageIndex(result.data.pageIndex);
                setPageCount(result.data.pageCount);
                setError(null);
            }
        } catch (err) {
            console.error("[useMovementEntriesInfinite] Erro inicial:", err);
            setError("Erro inesperado ao carregar lançamentos.");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, filters, pageSize]);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            if (initialData) {
                return;
            }
        }
        void loadInitial();
    }, [loadInitial, initialData]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore || isLoading) return;
        setIsLoadingMore(true);
        const nextPage = pageIndex + 2;
        try {
            const result = await fetcher({
                pageRequest: { page: nextPage, pageSize },
                filter: filters,
            });
            if (result.success && result.data) {
                setItems((prev) => [...prev, ...result.data.data]);
                setPageIndex(result.data.pageIndex);
                setPageCount(result.data.pageCount);
                setTotal(result.data.total);
            }
        } catch (err) {
            console.error("[useMovementEntriesInfinite] Erro ao carregar mais:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, isLoading, pageIndex, pageSize, fetcher, filters]);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (!node) return;
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0]?.isIntersecting) {
                        void loadMore();
                    }
                },
                { threshold: 0.1, rootMargin: "150px" }
            );
            observerRef.current.observe(node);
        },
        [loadMore]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return {
        items,
        total,
        hasMore,
        isLoading,
        isLoadingMore,
        error,
        reload: loadInitial,
        loadMore,
        sentinelRef,
    };
}

