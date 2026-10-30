import * as React from "react";
import { isValid, parse } from "date-fns";
import type { ViewPort } from "@/types/adaptive.types";
import { ErrorView } from "@/components/error-view";
import { getCategoryBasicInfoAction } from "@/modules/categories/ui/actions/get-category-basic-info.action";
import { resolveActiveTab } from "@/modules/categories/ui/views/category-tab.registry";
import { CategoryDetailHeader } from "@/modules/categories/ui/components/category-detail-header";
import { CategoryDetailTabs } from "@/modules/categories/ui/components/category-detail-tabs";
import { CategoryDetailSkeleton } from "@/modules/categories/ui/components/category-detail-skeleton";
import { CategoryDetailTabContent } from "@/modules/categories/ui/components/category-detail-tab-content";

export interface CategoryDetailViewProps {
  id?: string | null;
  searchParams?: {
    from?: string;
    to?: string;
    tab?: string;
  };
  initialViewport: ViewPort;
}

export async function CategoryDetailView({
  id,
  searchParams,
  initialViewport,
}: CategoryDetailViewProps) {
  let from: Date | undefined;
  let to: Date | undefined;

  if (searchParams?.from) {
    const parsedFrom = parse(searchParams.from, "yyyy-MM-dd", new Date());
    if (isValid(parsedFrom)) from = parsedFrom;
  }

  if (searchParams?.to) {
    const parsedTo = parse(searchParams.to, "yyyy-MM-dd", new Date());
    if (isValid(parsedTo)) to = parsedTo;
  }

  const basicInfoResult = await getCategoryBasicInfoAction({
    id: id ? Number(id) : null,
    from,
    to,
  });

  if (!basicInfoResult.success || !basicInfoResult.data) {
    return (
      <div className="p-4 w-full">
        <ErrorView
          title="Erro ao carregar detalhes da categoria"
          error={basicInfoResult.error ?? "Não foi possível carregar as informações."}
        />
      </div>
    );
  }

  const basicInfo = basicInfoResult.data;
  const activeTabItem = resolveActiveTab(basicInfo.availableTabs, searchParams?.tab);

  return (
    <div className="flex flex-col w-full min-w-0 py-4 gap-4">
      {/* Header com padding horizontal alinhado aos outros headers */}
      <div className="px-4 w-full">
        <CategoryDetailHeader basicInfo={basicInfo} />
      </div>

      {/* Barra de abas ponta a ponta (ocultada automaticamente quando há apenas uma aba disponível) */}
      {basicInfo.availableTabs.length > 1 && (
        <CategoryDetailTabs
          availableTabs={basicInfo.availableTabs}
          activeUrlTabString={activeTabItem.urlTabString}
        />
      )}

      {/* Conteúdo da aba ativa envolto em Suspense + Skeleton */}
      <div className="w-full min-w-0 px-4">
        <React.Suspense
          key={`${basicInfo.id ?? "overview"}-${activeTabItem.key}`}
          fallback={<CategoryDetailSkeleton />}
        >
          <CategoryDetailTabContent
            tabItem={activeTabItem}
            categoryId={basicInfo.id}
            from={from}
            to={to}
            initialViewport={initialViewport}
          />
        </React.Suspense>
      </div>
    </div>
  );
}

export default CategoryDetailView;
