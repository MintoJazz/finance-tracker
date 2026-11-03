"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMasterDetail } from "@/components/master-detail";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";
import { CategoryTreeItem } from "./category-tree-item";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  ListItem,
  ListItemHeader,
  ListItemAvatar,
  ListItemContent,
  ListItemTitle,
  ListItemSubtitle,
} from "@/components/list-item";

export interface CategoryTreeProps {
  items: CategoryItem[];
  activeId?: number | null;
  renderItemActions?: (item: CategoryItem) => React.ReactNode;
  loadingChildrenIds?: number[];
  onFetchChildren?: (categoryId: number) => Promise<void>;
  className?: string;
}

export function CategoryTree({
  items,
  activeId = null,
  renderItemActions,
  loadingChildrenIds = [],
  onFetchChildren,
  className,
}: CategoryTreeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, closeMaster } = useMasterDetail();

  // Rastreia itens explicitamente alternados pelo usuário
  const [toggledMap, setToggledMap] = React.useState<Record<number, boolean>>({});

  const isItemExpanded = (category: CategoryItem) => {
    if (toggledMap[category.id] !== undefined) {
      return toggledMap[category.id];
    }
    // Por padrão, expande a categoria pai se ela ou um de seus filhos estiver ativo
    if (category.id === activeId) return true;
    if (category.children?.some((child) => child.id === activeId)) return true;
    if (activeId) {
      const info = CategoriesMockService.findCategoryById(activeId);
      if (info?.parent?.id === category.id) return true;
    }
    return false;
  };

  const handleToggleExpand = (id: number) => {
    const targetCategory = items.find((item) => item.id === id);
    if (!targetCategory) return;

    const isCurrentlyExpanded = isItemExpanded(targetCategory);
    const willExpand = !isCurrentlyExpanded;

    setToggledMap((prev) => ({
      ...prev,
      [id]: willExpand,
    }));

    // Se estiver expandindo e ainda não tiver filhas carregadas
    if (
      willExpand &&
      (targetCategory.childrenCount ?? 0) > 0 &&
      (!targetCategory.children || targetCategory.children.length === 0) &&
      !loadingChildrenIds.includes(id)
    ) {
      void onFetchChildren?.(id);
    }
  };

  const isAllActive = activeId === null;

  const handleSelectAll = () => {
    const params = searchParams?.toString();
    const query = params ? `?${params}` : "";
    router.push(`/categories${query}`);
    if (isMobile) {
      closeMaster();
    }
  };

  return (
    <nav
      className={cn(
        "flex flex-col divide-y divide-border border-y border-border w-full",
        className
      )}
      aria-label="Lista de categorias"
    >
      {/* Nó Raiz: "Todas" de ponta a ponta */}
      <ListItem
        onSelect={handleSelectAll}
        className={cn(
          "w-full rounded-none transition-colors px-4 py-3",
          isAllActive
            ? "bg-secondary text-secondary-foreground font-medium"
            : "hover:bg-muted/50"
        )}
      >
        <ListItemHeader>
          <ListItemAvatar>
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 text-foreground bg-muted/70",
                isAllActive && "border-border/80 bg-background/60"
              )}
            >
              <Layers className="size-4" />
            </div>
          </ListItemAvatar>
          <ListItemContent>
            <ListItemTitle>
              <span className={cn("truncate text-sm text-foreground", isAllActive && "font-semibold")}>
                Todas as categorias
              </span>
            </ListItemTitle>
            <ListItemSubtitle>
              Visão consolidada
            </ListItemSubtitle>
          </ListItemContent>
        </ListItemHeader>
      </ListItem>

      {/* Categorias principais e subcategorias */}
      {items.map((category: CategoryItem) => {
        const isExpanded = isItemExpanded(category);
        const isParentActive = activeId === category.id;
        const isLoading = loadingChildrenIds.includes(category.id);
        const hasChildrenLoaded = Boolean(category.children && category.children.length > 0);
        const shouldShowContent = isExpanded && (isLoading || hasChildrenLoaded);

        return (
          <Collapsible
            key={category.id}
            open={isExpanded}
            onOpenChange={() => handleToggleExpand(category.id)}
            className="flex flex-col w-full divide-y divide-border"
          >
            <CategoryTreeItem
              item={category}
              level={0}
              isActive={isParentActive}
              isExpanded={isExpanded}
              isLoadingChildren={isLoading}
              onToggleExpand={handleToggleExpand}
              actionTrigger={renderItemActions?.(category)}
            />

            {/* Subitens ou indicador de carregamento de ponta a ponta */}
            {shouldShowContent && (
              <CollapsibleContent className="flex flex-col w-full divide-y divide-border overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {isLoading && (
                  <div className="flex flex-col w-full pl-10 pr-4 py-3 gap-2.5 bg-muted/15 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                      <span>Carregando subcategorias...</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted/40" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted/40" />
                    </div>
                  </div>
                )}

                {!isLoading && hasChildrenLoaded && (
                  category.children.map((subitem: CategoryItem) => {
                    const isSubActive = activeId === subitem.id;
                    return (
                      <CategoryTreeItem
                        key={subitem.id}
                        item={subitem}
                        level={1}
                        isActive={isSubActive}
                        actionTrigger={renderItemActions?.(subitem)}
                      />
                    );
                  })
                )}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </nav>
  );
}

export default CategoryTree;
