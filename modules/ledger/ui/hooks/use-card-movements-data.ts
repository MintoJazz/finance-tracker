"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Page, PageRequest } from "@/types/pagination.types";
import {
    WalletMovement,
    WalletMovementFilters,
} from "../../core/schemas/wallet-movement.schema";
import { getCardMovementsAction } from "../actions/get-card-movements.action";
import {
    UseWalletMovementsInfiniteReturn,
    UseWalletMovementsPaginatedReturn,
} from "./use-wallet-movements-data";

export function useCardMovementsPaginated(
    cardId: number,
    filters: WalletMovementFilters
): UseWalletMovementsPaginatedReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const rawPage = Number(searchParams.get("page"));
    const rawPageSize = Number(searchParams.get("pageSize"));
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
        !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

    const [data, setData] = useState<Page<WalletMovement> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const hasCycleWindow = Boolean(filters.from && filters.to);

    const loadData = useCallback(async () => {
        if (!hasCycleWindow) return;

        setIsLoading(true);
        setError(null);
        try {
            const pageRequest: PageRequest = { page, pageSize };
            const result = await getCardMovementsAction({
                walletId: cardId,
                pageRequest,
                filter: filters,
            });
            if (!result.success || !result.data) {
                setError(result.error ?? "Erro ao carregar lançamentos da fatura.");
                setData(null);
            } else {
                setData(result.data);
                setError(null);
            }
        } catch (err) {
            console.error("[useCardMovementsPaginated] Erro crítico:", err);
            setError("Erro inesperado ao carregar lançamentos da fatura.");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [cardId, page, pageSize, filters, hasCycleWindow]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadData();
    }, [loadData]);

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

export function useCardMovementsInfinite(
    cardId: number,
    filters: WalletMovementFilters,
    pageSize = 10
): UseWalletMovementsInfiniteReturn {
    const [items, setItems] = useState<WalletMovement[]>([]);
    const [pageIndex, setPageIndex] = useState<number>(0);
    const [pageCount, setPageCount] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const hasCycleWindow = Boolean(filters.from && filters.to);
    const hasMore = pageIndex < pageCount - 1 && items.length < total;

    const loadInitial = useCallback(async () => {
        if (!hasCycleWindow) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await getCardMovementsAction({
                walletId: cardId,
                pageRequest: { page: 1, pageSize },
                filter: filters,
            });
            if (!result.success || !result.data) {
                setError(result.error ?? "Erro ao carregar lançamentos da fatura.");
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
            console.error("[useCardMovementsInfinite] Erro inicial:", err);
            setError("Erro inesperado ao carregar lançamentos da fatura.");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [cardId, filters, pageSize, hasCycleWindow]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadInitial();
    }, [loadInitial]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore || isLoading || !hasCycleWindow) return;
        setIsLoadingMore(true);
        const nextPage = pageIndex + 2;
        try {
            const result = await getCardMovementsAction({
                walletId: cardId,
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
            console.error("[useCardMovementsInfinite] Erro ao carregar mais:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, isLoading, hasCycleWindow, pageIndex, pageSize, cardId, filters]);

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