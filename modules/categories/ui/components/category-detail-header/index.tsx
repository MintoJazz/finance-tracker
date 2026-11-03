"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ArrowRight, ArrowLeft, MoreVertical } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useMasterDetail } from "@/components/master-detail";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge";
import type { CategoryBasicInfoDTO } from "@/modules/categories/models/category-tab.schema";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { CategoriesMasterFilter } from "@/modules/categories/ui/components/categories-master-filter";
import { CategoryActionsDrawer } from "@/modules/categories/ui/components/category-actions-drawer";
import { DataTableRowActions } from "@/components/actions/menu";
import { CATEGORY_ACTIONS } from "@/modules/categories/ui/components/category-actions";
import { cn } from "@/lib/utils";

export interface CategoryDetailHeaderProps {
  basicInfo: CategoryBasicInfoDTO;
  category?: CategoryItem | null;
  className?: string;
}

export function CategoryDetailHeader({
  basicInfo,
  category,
  className,
}: CategoryDetailHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openMaster } = useMasterDetail();

  const isCategorySelected = Boolean(basicInfo.id);

  const handleClearSelection = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    const query = params.toString() ? `?${params.toString()}` : "";
    router.push(`/categories${query}`);
  };

  const handleNavigateParent = () => {
    if (basicInfo.parentId) {
      const params = new URLSearchParams(searchParams.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      router.push(`/categories/${basicInfo.parentId}${query}`);
    } else {
      handleClearSelection();
    }
  };

  const dateRange: DateRange = React.useMemo(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let from = basicInfo.period.from;
    let to = basicInfo.period.to;

    if (fromParam) {
      const parsed = parse(fromParam, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) from = parsed;
    }
    if (toParam) {
      const parsed = parse(toParam, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) to = parsed;
    }

    return { from, to };
  }, [searchParams, basicInfo.period]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
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
    router.push(`?${params.toString()}`);
  };

  const categoryColor = basicInfo.appearance?.color ?? basicInfo.color;
  const categoryIcon = basicInfo.appearance?.icon ?? basicInfo.icon;
  const theme = isCategorySelected ? getCategoryTheme(categoryColor) : null;

  const rowLikeCategory: CategoryItem | null = React.useMemo(() => {
    if (!basicInfo.id) return null;
    return (
      category ?? {
        id: basicInfo.id,
        name: basicInfo.name,
        icon: basicInfo.icon,
        color: basicInfo.color,
        amount: 0,
        parentId: basicInfo.parentId,
        childrenCount: 0,
        children: [],
      }
    );
  }, [basicInfo, category]);

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {/* ======================================================== */}
      {/* 1. SEÇÃO EXCLUSIVA MOBILE (< md)                         */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-2.5 w-full md:hidden">
        {/* Linha 1 Mobile: Breadcrumb e botão para abrir a lista Master */}
        <div className="flex items-center justify-between w-full">
          {isCategorySelected ? (
            <button
              type="button"
              onClick={handleNavigateParent}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate max-w-[70%]"
            >
              <ArrowLeft className="size-3.5 shrink-0" />
              <span className="truncate">
                {basicInfo.parentName
                  ? `Todas as categorias › ${basicInfo.parentName}`
                  : "Todas as categorias"}
              </span>
            </button>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              Categorias
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openMaster}
            className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 -mr-1"
          >
            <span>Ver Categorias</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {/* Linha 2 Mobile: Título/Ícone à esquerda e Botão de Ações à direita */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {theme && categoryIcon && (
              <div
                style={theme.style}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                  theme.palette
                    ? cn(theme.palette.bg, theme.palette.text, theme.palette.border ?? "border-border/40")
                    : "border-border/40 bg-muted/70 text-foreground"
                )}
              >
                <CategoryIcon name={categoryIcon} className="size-3.5" />
              </div>
            )}
            <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">
              {basicInfo.name}
            </h1>
          </div>

          {rowLikeCategory && (
            <CategoryActionsDrawer
              category={rowLikeCategory}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Ações da categoria"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
          )}
        </div>

        {/* Linha 3 Mobile: Seletor de Período (apenas no mobile, pois no desktop está na barra fixa à direita) */}
        <div className="w-full">
          <CategoriesMasterFilter
            dateRange={dateRange}
            onChangeDateRange={handleDateRangeChange}
            isMobile={true}
            className="w-full h-8"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEÇÃO EXCLUSIVA DESKTOP (>= md)                        */}
      {/* ======================================================== */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Esquerda: Botão limpar (se categoria selecionada) + Ícone + Título */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isCategorySelected && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-8 text-muted-foreground hover:text-foreground -ml-1 shrink-0"
              onClick={handleClearSelection}
              aria-label="Limpar seleção de categoria"
              title="Voltar para visão geral"
            >
              <X className="size-4" />
            </Button>
          )}

          {theme && categoryIcon && (
            <div
              style={theme.style}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                theme.palette
                  ? cn(theme.palette.bg, theme.palette.text, theme.palette.border ?? "border-border/40")
                  : "border-border/40 bg-muted/70 text-foreground"
              )}
            >
              <CategoryIcon name={categoryIcon} className="size-4" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
              {basicInfo.name}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {isCategorySelected
                ? basicInfo.scope === "ROOT"
                  ? "Categoria principal • Indicadores, subcategorias e lançamentos"
                  : "Subcategoria • Indicadores e lançamentos detalhados"
                : "Visão consolidada de todas as categorias cadastradas"}
            </p>
          </div>
        </div>

        {/* Direita: Ações da Categoria no Desktop */}
        {rowLikeCategory && (
          <div className="flex items-center gap-2 shrink-0">
            <DataTableRowActions
              row={{ original: rowLikeCategory }}
              actions={CATEGORY_ACTIONS}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label="Opções da categoria"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryDetailHeader;
