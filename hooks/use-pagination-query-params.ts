"use client";

import { useQueryParams } from "@/hooks/use-query-params";

export function usePaginationQueryParams() {
    const { setParam } = useQueryParams();

    const setPage = (pageIndex: number) => setParam("page", String(pageIndex + 1));
    const setPageSize = (size: number) => setParam("pageSize", String(size));

    return {
        paginationContext: {
            setPage,
            setPageSize,
        },
    };
}
