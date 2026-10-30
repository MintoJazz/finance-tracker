"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, isValid, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useMasterDetail } from "@/components/master-detail";
import type { CategoryItem, CategoryTreeDTO } from "@/modules/categories/models/category.schema";
import type { CategoriesMasterDesktopProps } from "../types";
import type { CategoryActionContext } from "@/modules/categories/ui/components/category-actions";

export function useDesktopCategoriesMaster(
  data: CategoryTreeDTO
): CategoriesMasterDesktopProps {
  const { segment } = useMasterDetail();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // Lê `from` e `to` da URL ou faz fallback para o período padrão da action
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
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const activeId = React.useMemo(() => {
    if (!segment) return null;
    const parsed = Number(segment);
    return Number.isInteger(parsed) ? parsed : null;
  }, [segment]);

  const actionContext = React.useMemo<CategoryActionContext>(
    () => ({
      onAddSubcategory: (cat: CategoryItem) => {
        console.log("[Desktop] Nova subcategoria para:", cat.name);
        setIsAddModalOpen(true);
      },
      onEdit: (cat: CategoryItem) => {
        console.log("[Desktop] Editar categoria:", cat.name);
      },
      onArchive: (cat: CategoryItem) => {
        console.log("[Desktop] Arquivar categoria:", cat.name);
      },
    }),
    []
  );

  return {
    data,
    dateRange,
    onChangeDateRange,
    activeId,
    isAddModalOpen,
    onOpenAddModal: () => setIsAddModalOpen(true),
    onCloseAddModal: () => setIsAddModalOpen(false),
    actionContext,
  };
}
