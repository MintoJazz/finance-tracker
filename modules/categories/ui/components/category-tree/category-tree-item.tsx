"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMasterDetail } from "@/components/master-detail";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import {
  ListItem,
  ListItemHeader,
  ListItemAvatar,
  ListItemContent,
  ListItemTitle,
  ListItemActions,
  ListItemFooter,
  ListItemFooterLeft,
  ListItemFooterInfo,
} from "@/components/list-item";

export interface CategoryTreeItemProps {
  item: CategoryItem;
  level?: number;
  isActive?: boolean;
  isExpanded?: boolean;
  isLoadingChildren?: boolean;
  onToggleExpand?: (id: number) => void;
  actionTrigger?: React.ReactNode;
  className?: string;
}

export function CategoryTreeItem({
  item,
  level = 0,
  isActive = false,
  isExpanded = false,
  isLoadingChildren = false,
  onToggleExpand,
  actionTrigger,
  className,
}: CategoryTreeItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, closeMaster } = useMasterDetail();

  const hasChildren = (item.childrenCount ?? (item.children?.length ?? 0)) > 0;
  const hasChildrenLoaded = Boolean(item.children && item.children.length > 0);
  const isEffectivelyExpanded = isExpanded && hasChildrenLoaded;
  const isSubitem = level > 0;

  // Resolve a aparência da categoria (cor e ícone)
  const categoryColor = item.appearance?.color ?? item.color;
  const categoryIcon = item.appearance?.icon ?? item.icon;
  const theme = getCategoryTheme(categoryColor);

  const handleSelect = () => {
    const params = searchParams?.toString();
    const query = params ? `?${params}` : "";
    router.push(`/categories/${item.id}${query}`);
    if (isMobile) {
      closeMaster();
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand?.(item.id);
  };

  return (
    <ListItem
      onSelect={handleSelect}
      className={cn(
        "relative w-full rounded-none transition-colors",
        isActive
          ? "bg-secondary text-secondary-foreground font-medium"
          : "hover:bg-muted/50",
        isSubitem
          ? "pl-10 pr-4 py-2.5 bg-muted/15 hover:bg-muted/30 before:absolute before:left-6 before:top-0 before:bottom-0 before:bg-border"
          : "px-4 py-3",
        className
      )}
    >
      <ListItemHeader>
        <ListItemAvatar>
          <div
            style={theme.style}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg border transition-colors",
              isSubitem ? "size-7" : "size-8",
              theme.palette
                ? cn(theme.palette.bg, theme.palette.text, theme.palette.border ?? "border-border/40")
                : "border-border/40 bg-muted/70 text-foreground"
            )}
          >
            <CategoryIcon
              name={categoryIcon}
              className={cn(isSubitem ? "size-3.5" : "size-4")}
            />
          </div>
        </ListItemAvatar>

        <ListItemContent>
          <ListItemTitle>
            <span
              className={cn(
                "truncate text-foreground text-sm",
                isActive && "font-semibold"
              )}
            >
              {item.name}
            </span>
          </ListItemTitle>
        </ListItemContent>

        {actionTrigger && (
          <ListItemActions>
            {actionTrigger}
          </ListItemActions>
        )}
      </ListItemHeader>

      {/* Apenas categorias-pai com subitens possuem footer com o botão colapsável */}
      {!isSubitem && hasChildren && (
        <ListItemFooter>
          <ListItemFooterLeft>
            <ListItemFooterInfo
              icon={
                isLoadingChildren
                  ? () => <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  : isEffectivelyExpanded
                  ? ChevronDown
                  : ChevronRight
              }
              className={cn(
                "text-muted-foreground transition-colors select-none text-xs font-medium",
                isLoadingChildren
                  ? "cursor-default"
                  : "cursor-pointer hover:text-foreground"
              )}
              onClick={isLoadingChildren ? undefined : handleToggle}
            >
              <button
                type="button"
                disabled={isLoadingChildren}
                className={cn(
                  "focus-visible:outline-none",
                  !isLoadingChildren && "hover:underline"
                )}
                onClick={isLoadingChildren ? undefined : handleToggle}
                aria-label={
                  isLoadingChildren
                    ? "Carregando subcategorias"
                    : isEffectivelyExpanded
                    ? "Ocultar subcategorias"
                    : "Exibir subcategorias"
                }
              >
                {isLoadingChildren
                  ? "Carregando subcategorias..."
                  : isEffectivelyExpanded
                  ? "Ocultar subcategorias"
                  : `${item.childrenCount} ${item.childrenCount === 1 ? "subcategoria" : "subcategorias"}`}
              </button>
            </ListItemFooterInfo>
          </ListItemFooterLeft>
        </ListItemFooter>
      )}
    </ListItem>
  );
}

export default CategoryTreeItem;
