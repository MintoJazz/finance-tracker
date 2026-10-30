import * as React from "react";
import type { ViewPort } from "@/types/adaptive.types";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import type { CategoryTabRegistryItem } from "@/modules/categories/ui/views/category-tab.registry";

export interface CategoryDetailTabContentProps {
  tabItem: CategoryTabRegistryItem;
  categoryId?: number | null;
  from?: Date;
  to?: Date;
  initialViewport?: ViewPort;
}

export async function CategoryDetailTabContent({
  tabItem,
  categoryId,
  from,
  to,
  initialViewport = "desktop",
}: CategoryDetailTabContentProps) {
  const result = await tabItem.action({
    categoryId,
    from,
    to,
  });

  if (!result.success || !result.data) {
    return (
      <ErrorView
        title="Erro ao carregar conteúdo da aba"
        error={result.error ?? "Não foi possível carregar as informações."}
      />
    );
  }

  return (
    <ViewContainer
      initialViewport={initialViewport}
      data={result.data}
      {...tabItem.config}
    />
  );
}

export default CategoryDetailTabContent;

