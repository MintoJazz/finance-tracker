"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { useEffect, useState } from "react";

export function useOverviewFilters() {
    const { getParam, setParam } = useQueryParams();

    const [search, setSearch] = useState(getParam("search"));
    const debouncedSearch = useDebounce(search);

    const searchProps = {
        value: search,
        onValueChange: setSearch,
    };

    useEffect(() => {
        if (debouncedSearch !== getParam("search")) {
            setParam("search", debouncedSearch);
        }
    }, [debouncedSearch, getParam, setParam]);

    return {
        debouncedSearch,
        filterContext: {
            searchProps,
        },
    };
}
