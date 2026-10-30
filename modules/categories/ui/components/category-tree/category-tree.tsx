"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMasterDetail } from "@/components/master-detail";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
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
  className?: string;
}

export function CategoryTree({
  items,
  activeId = null,
  renderItemActions,
  className,
}: CategoryTreeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, closeMaster } = useMasterDetail();

  // Rastreia itens explicitamente alternados pelo usuário (sem necessidade de useEffect)
  const [toggledMap, setToggledMap] = React.useState<Record<number, boolean>>({});

  const isItemExpanded = (category: CategoryItem) => {
    if (toggledMap[category.id] !== undefined) {
      return toggledMap[category.id];
    }
    // Por padrão, expande a categoria pai se ela ou um de seus filhos estiver ativo
    return (
      category.id === activeId ||
      Boolean(category.children?.some((child) => child.id === activeId))
    );
  };

  const handleToggleExpand = (id: number) => {
    setToggledMap((prev) => {
      const targetCategory = items.find((item) => item.id === id);
      const isCurrentlyExpanded =
        prev[id] !== undefined
          ? prev[id]
          : targetCategory
          ? targetCategory.id === activeId ||
            Boolean(targetCategory.children?.some((child) => child.id === activeId))
          : false;

      return {
        ...prev,
        [id]: !isCurrentlyExpanded,
      };
    });
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
              onToggleExpand={handleToggleExpand}
              actionTrigger={renderItemActions?.(category)}
            />

            {/* Subitens de ponta a ponta */}
            {category.children && category.children.length > 0 && (
              <CollapsibleContent className="flex flex-col w-full divide-y divide-border overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {category.children.map((subitem: CategoryItem) => {
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
                })}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </nav>
  );
}

export default CategoryTree;
