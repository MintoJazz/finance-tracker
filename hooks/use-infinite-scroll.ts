"use client"

import { Page, PageRequest } from "@/types/pagination.types";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInfiniteScrollOptions<T> {
    data: Page<T>;
    fetchNextPage: (pageRequest: PageRequest) => Promise<Page<T> | null | undefined>;
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
}

export interface UseInfiniteScrollReturn<T> {
    items: T[];
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    pageIndex: number;
    pageCount: number;
    total: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => Promise<void>;
    sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useInfiniteScroll<T>({
    data,
    fetchNextPage,
    threshold = 0.1,
    rootMargin = "150px",
    enabled = true
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
    const [items, setItems] = useState<T[]>(data.data);
    const [pageIndex, setPageIndex] = useState<number>(data.pageIndex);
    const [pageCount, setPageCount] = useState<number>(data.pageCount);
    const [total, setTotal] = useState<number>(data.total);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    const hasMore = pageIndex < pageCount - 1 && items.length < total;

    const fetchNextPageRef = useRef(fetchNextPage);
    fetchNextPageRef.current = fetchNextPage;

    useEffect(() => {
        setItems(data.data);
        setPageIndex(data.pageIndex);
        setPageCount(data.pageCount);
        setTotal(data.total);
    }, [data]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore || !enabled) return;

        setIsLoadingMore(true);
        const nextPage = pageIndex + 2; // PageRequest é 1-indexed

        try {
            const result = await fetchNextPageRef.current({
                page: nextPage,
                pageSize: data.pageSize
            });

            if (result) {
                setItems((prev) => [...prev, ...result.data]);
                setPageIndex(result.pageIndex);
                setPageCount(result.pageCount);
                setTotal(result.total);
            }
        } catch (error) {
            console.error("Falha ao carregar mais itens:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, enabled, pageIndex, data.pageSize]);

    const observerRef = useRef<IntersectionObserver | null>(null);

    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            if (!node || !enabled) return;

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0]?.isIntersecting) {
                        void loadMore();
                    }
                },
                { threshold, rootMargin }
            );

            observerRef.current.observe(node);
        },
        [loadMore, enabled, threshold, rootMargin]
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
        setItems,
        pageIndex,
        pageCount,
        total,
        hasMore,
        isLoadingMore,
        loadMore,
        sentinelRef
    };
}
