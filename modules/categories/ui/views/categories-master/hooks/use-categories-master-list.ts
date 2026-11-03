"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, isValid, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useMasterDetail } from "@/components/master-detail";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useDebounce } from "@/hooks/use-debounce";
import type { Page } from "@/types/pagination.types";
import type { CategoryItem, CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import { getCategoriesTreeAction } from "@/modules/categories/ui/actions/get-categories-tree.action";
import { getCategoryChildrenAction } from "@/modules/categories/ui/actions/get-category-children.action";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";

export function useCategoriesMasterList(data: CategoryTreeDTO) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { segment } = useMasterDetail();

  // 1. Filtro de Busca (Sincronizado via URL com Debounce)
  const initialSearchParam = searchParams.get("search") ?? "";
  const [search, setSearch] = React.useState(initialSearchParam);
  const debouncedSearch = useDebounce(search, 350);

  // Mantém estado local sincronizado se a URL mudar externamente
  React.useEffect(() => {
    const currentParam = searchParams.get("search") ?? "";
    if (currentParam !== search && debouncedSearch === currentParam) {
      setSearch(currentParam);
    }
  }, [searchParams]);

  // 2. Filtro de Período (Sincronizado via URL)
  const dateRange = React.useMemo<DateRange>(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    if (fromParam && toParam) {
      const fromDate = parse(fromParam, "yyyy-MM-dd", new Date());
      const toDate = parse(toParam, "yyyy-MM-dd", new Date());
      if (isValid(fromDate) && isValid(toDate)) {
        return { from: fromDate, to: toDate };
      }
    }
    return {
      from: data.period.from,
      to: data.period.to,
    };
  }, [searchParams, data.period]);

  const onChangeDateRange = React.useCallback(
    (range: DateRange | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (range?.from) {
        params.set("from", format(range.from, "yyyy-MM-dd"));
      } else {
        params.delete("from");
      }
      if (range?.to) {
        params.set("to", format(range.to, "yyyy-MM-dd"));
      } else {
        params.delete("to");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // 3. Paginação via Rolagem Infinita com Estado Dinâmico de Page
  const [pageData, setPageData] = React.useState<Page<CategoryItem>>(data.page);

  // Se `data.page` mudar do servidor (ex: navegação com full reload), sincroniza `pageData`
  React.useEffect(() => {
    setPageData(data.page);
  }, [data.page]);

  const {
    items,
    setItems,
    total,
    hasMore,
    isLoadingMore,
    sentinelRef,
  } = useInfiniteScroll<CategoryItem>({
    data: pageData,
    fetchNextPage: async (pageRequest) => {
      const result = await getCategoriesTreeAction({
        pageRequest,
        search: debouncedSearch.trim() || undefined,
        from: dateRange?.from,
        to: dateRange?.to,
      });

      if (!result.success || !result.data) {
        console.error("[useCategoriesMasterList] Falha ao carregar próxima página:", result.error);
        return null;
      }

      return result.data.page;
    },
  });

  // Aplica filtro de busca e período ativamente no cliente e sincroniza URL
  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    // No primeiro mount, não precisa refazer a query inicial do servidor a menos que haja discrepância
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    let cancelled = false;

    // Atualiza URL
    const currentParam = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }

    // Executa a busca da página 1 com os novos filtros
    const fetchFiltered = async () => {
      try {
        const result = await getCategoriesTreeAction({
          search: debouncedSearch.trim() || undefined,
          from: dateRange?.from,
          to: dateRange?.to,
          pageRequest: { page: 1, pageSize: 6 },
        });

        if (!cancelled && result.success && result.data) {
          setPageData(result.data.page);
        }
      } catch (err) {
        console.error("[useCategoriesMasterList] Erro ao filtrar categorias:", err);
      }
    };

    void fetchFiltered();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, dateRange]);

  // 4. Lazy Loading das Subcategorias em Memória
  const [loadingChildrenMap, setLoadingChildrenMap] = React.useState<Record<number, boolean>>({});

  const onFetchChildren = React.useCallback(
    async (parentId: number) => {
      if (loadingChildrenMap[parentId]) return;

      setLoadingChildrenMap((prev) => ({ ...prev, [parentId]: true }));
      try {
        const result = await getCategoryChildrenAction({
          parentId,
          from: dateRange?.from,
          to: dateRange?.to,
        });

        if (result.success && result.data) {
          const childrenData = result.data;
          setItems((prevItems) =>
            prevItems.map((cat) =>
              cat.id === parentId ? { ...cat, children: childrenData } : cat
            )
          );
        }
      } catch (err) {
        console.error("[useCategoriesMasterList] Erro ao carregar subcategorias:", err);
      } finally {
        setLoadingChildrenMap((prev) => ({ ...prev, [parentId]: false }));
      }
    },
    [dateRange, loadingChildrenMap, setItems]
  );

  // 5. Categoria Ativa (URL segment)
  const activeId = React.useMemo(() => {
    if (!segment) return null;
    const parsed = Number(segment);
    return Number.isInteger(parsed) ? parsed : null;
  }, [segment]);

  // Carrega automaticamente as subcategorias se a categoria ativa (ou seu pai) estiver sem filhas em memória
  React.useEffect(() => {
    if (!activeId) return;

    // Caso 1: A categoria ativa é uma categoria-pai na lista
    const activeParent = items.find((cat) => cat.id === activeId);
    if (
      activeParent &&
      (activeParent.childrenCount ?? 0) > 0 &&
      (!activeParent.children || activeParent.children.length === 0) &&
      !loadingChildrenMap[activeParent.id]
    ) {
      void onFetchChildren(activeParent.id);
      return;
    }

    // Caso 2: A categoria ativa é uma subcategoria (filha)
    const found = CategoriesMockService.findCategoryById(activeId);
    if (found?.parent) {
      const parentId = found.parent.id;
      const parentInList = items.find((i) => i.id === parentId);
      if (
        parentInList &&
        (!parentInList.children || parentInList.children.length === 0) &&
        !loadingChildrenMap[parentId]
      ) {
        void onFetchChildren(parentId);
      }
    }
  }, [activeId, items, loadingChildrenMap, onFetchChildren]);

  const loadingChildrenIds = React.useMemo(() => {
    return Object.entries(loadingChildrenMap)
      .filter(([, isLoading]) => isLoading)
      .map(([id]) => Number(id));
  }, [loadingChildrenMap]);

  return {
    items,
    total,
    hasMore,
    isLoadingMore,
    sentinelRef,
    search,
    onSearchChange: setSearch,
    dateRange,
    onChangeDateRange,
    activeId,
    loadingChildrenIds,
    onFetchChildren,
  };
}
