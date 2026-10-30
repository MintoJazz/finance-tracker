"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
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
  onToggleExpand?: (id: number) => void;
  actionTrigger?: React.ReactNode;
  className?: string;
}

export function CategoryTreeItem({
  item,
  level = 0,
  isActive = false,
  isExpanded = false,
  onToggleExpand,
  actionTrigger,
  className,
}: CategoryTreeItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, closeMaster } = useMasterDetail();

  const hasChildren = Boolean(item.children && item.children.length > 0);
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
              icon={isExpanded ? ChevronDown : ChevronRight}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none text-xs font-medium"
              onClick={handleToggle}
            >
              <button
                type="button"
                className="hover:underline focus-visible:outline-none"
                onClick={handleToggle}
                aria-label={isExpanded ? "Ocultar subcategorias" : "Exibir subcategorias"}
              >
                {isExpanded
                  ? "Ocultar subcategorias"
                  : `${item.children?.length} ${item.children?.length === 1 ? "subcategoria" : "subcategorias"}`}
              </button>
            </ListItemFooterInfo>
          </ListItemFooterLeft>
        </ListItemFooter>
      )}
    </ListItem>
  );
}

export default CategoryTreeItem;
