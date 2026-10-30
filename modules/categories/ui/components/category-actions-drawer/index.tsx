"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import type { RowAction } from "@/types/actions.types";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { CATEGORY_ACTIONS, type CategoryActionContext } from "../category-actions";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge";
import { cn } from "@/lib/utils";

export interface CategoryActionsDrawerProps {
  category?: CategoryItem | null;
  context?: CategoryActionContext;
  actions?: RowAction<CategoryItem, CategoryActionContext>[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement | null;
}

export function CategoryActionsDrawerHeader({ category }: { category: CategoryItem }) {
  const categoryColor = category.appearance?.color ?? category.color;
  const categoryIcon = category.appearance?.icon ?? category.icon;
  const theme = getCategoryTheme(categoryColor);

  return (
    <div className="flex items-center gap-3 py-1">
      <div
        style={theme.style}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          theme.palette
            ? cn(theme.palette.bg, theme.palette.text, theme.palette.border ?? "border-border/50")
            : "bg-muted border-border/50 text-foreground"
        )}
      >
        <CategoryIcon name={categoryIcon} className="size-4.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm text-foreground truncate">{category.name}</span>
        <span className="text-xs text-muted-foreground">
          {category.parentId ? "Subcategoria" : "Categoria principal"}
        </span>
      </div>
    </div>
  );
}

export function CategoryActionsDrawer({
  category,
  context,
  actions = CATEGORY_ACTIONS,
  open,
  onOpenChange,
  trigger,
}: CategoryActionsDrawerProps) {
  return (
    <ActionsDrawer
      open={open}
      onOpenChange={onOpenChange}
      row={category ?? undefined}
      actions={actions}
      context={context}
      trigger={trigger}
      header={category ? <CategoryActionsDrawerHeader category={category} /> : null}
    />
  );
}

export default CategoryActionsDrawer;
