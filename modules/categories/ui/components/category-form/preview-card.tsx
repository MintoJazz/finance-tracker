"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  type CategoryFormValues,
} from "@/modules/categories/models/category.schema";
import { cn } from "@/lib/utils";
import type { CategoryParentSummary } from "./types";

export interface CategoryPreviewCardProps {
  parentCategory?: CategoryParentSummary | null;
  className?: string;
}

export function CategoryPreviewCard({
  parentCategory,
  className,
}: CategoryPreviewCardProps) {
  const { watch } = useFormContext<CategoryFormValues>();
  const name = watch("name")?.trim();
  const color = (watch("color") || DEFAULT_CATEGORY_COLOR).toUpperCase();
  const icon = watch("icon") || DEFAULT_CATEGORY_ICON;

  const isSubcategory = Boolean(parentCategory);
  const placeholderName = isSubcategory
    ? "Nome da subcategoria"
    : "Nome da categoria";
  const subtitle = isSubcategory
    ? `Subcategoria • ${parentCategory?.name}`
    : "Categoria raiz";

  return (
    <div
      style={{
        backgroundColor: `${color}14`,
        borderColor: `${color}30`,
      }}
      className={cn(
        "flex flex-1 min-h-48 flex-col items-center justify-center rounded-xl border p-5 text-center transition-colors select-none",
        className
      )}
    >
      <div
        style={{
          backgroundColor: `${color}1F`,
          borderColor: `${color}66`,
          color: color,
        }}
        className="mb-3.5 flex size-13 items-center justify-center rounded-2xl border transition-colors shadow-2xs"
      >
        <CategoryIcon name={icon} className="size-6" />
      </div>

      <p
        className={cn(
          "max-w-full truncate text-base font-semibold tracking-tight transition-colors",
          name ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {name || placeholderName}
      </p>

      <span className="mt-1 max-w-full truncate text-xs text-muted-foreground">
        {subtitle}
      </span>
    </div>
  );
}

export default CategoryPreviewCard;

