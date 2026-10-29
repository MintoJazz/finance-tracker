"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Page } from "@/types/pagination.types";
import { ContractCycleItem, ContractCycleFilters } from "@/modules/cycles/models/contract-cycle.schema";
import { getContractCyclesAction } from "@/modules/cycles/ui/actions/get-contract-cycles.action";

export interface UseContractCyclesPaginatedReturn {
    data: Page<ContractCycleItem> | null;
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    paginationContext: {
        setPage: (pageIndex: number) => void;
        setPageSize: (size: number) => void;
    };
}

export function useContractCyclesPaginated(
    contractId: string | number,
    filters: ContractCycleFilters,
    initialData?: Page<ContractCycleItem> | null
): UseContractCyclesPaginatedReturn {
    const numericId = typeof contractId === "string" ? Number(contractId) : contractId;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const rawPage = Number(searchParams.get("page"));
    const rawPageSize = Number(searchParams.get("pageSize"));
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
        !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

    const [data, setData] = useState<Page<ContractCycleItem> | null>(initialData ?? null);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<string | null>(null);
    const hasMountedRef = useRef(false);

    const loadData = useCallback(async () => {
        if (!numericId || Number.isNaN(numericId)) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await getContractCyclesAction({
                contractId: numericId,
                pageRequest: { page, pageSize },
                filter: filters,
            });

            if (!result.success || !result.data) {
                setError(result.error ?? "Erro ao carregar ciclos do contrato.");
                setData(null);
            } else {
                setData(result.data);
                setError(null);
            }
        } catch (err) {
            console.error("[useContractCyclesPaginated] Erro crítico:", err);
            setError("Erro inesperado ao carregar ciclos do contrato.");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [numericId, page, pageSize, filters]);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            if (initialData && page === 1) {
                return;
            }
        }
        void loadData();
    }, [loadData, initialData, page]);

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

export interface UseContractCyclesInfiniteReturn {
    items: ContractCycleItem[];
    total: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    reload: () => Promise<void>;
    loadMore: () => Promise<void>;
    sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useContractCyclesInfinite(
    contractId: string | number,
    filters: ContractCycleFilters,
    pageSize = 10,
    initialData?: Page<ContractCycleItem> | null
): UseContractCyclesInfiniteReturn {
    const numericId = typeof contractId === "string" ? Number(contractId) : contractId;
    const [items, setItems] = useState<ContractCycleItem[]>(initialData?.data ?? []);
    const [pageIndex, setPageIndex] = useState<number>(initialData?.pageIndex ?? 0);
    const [pageCount, setPageCount] = useState<number>(initialData?.pageCount ?? 1);
    const [total, setTotal] = useState<number>(initialData?.total ?? 0);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const hasMountedRef = useRef(false);

    const hasMore = pageIndex < pageCount - 1 && items.length < total;

    const loadInitial = useCallback(async () => {
        if (!numericId || Number.isNaN(numericId)) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await getContractCyclesAction({
                contractId: numericId,
                pageRequest: { page: 1, pageSize },
                filter: filters,
            });

            if (!result.success || !result.data) {
                setError(result.error ?? "Erro ao carregar ciclos do contrato.");
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
            console.error("[useContractCyclesInfinite] Erro inicial:", err);
            setError("Erro inesperado ao carregar ciclos do contrato.");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [numericId, filters, pageSize]);

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
        if (isLoadingMore || !hasMore || isLoading || !numericId) return;
        setIsLoadingMore(true);
        const nextPage = pageIndex + 2;

        try {
            const result = await getContractCyclesAction({
                contractId: numericId,
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
            console.error("[useContractCyclesInfinite] Erro ao carregar mais:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, isLoading, numericId, pageIndex, pageSize, filters]);

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
