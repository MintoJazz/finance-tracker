"use client";

import * as React from "react";
import { Loader2, MoreHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DataTableRowActions } from "@/components/actions/menu";
import { CategoriesMasterHeader } from "@/modules/categories/ui/components/categories-master-header";
import { CategoriesMasterFilter } from "@/modules/categories/ui/components/categories-master-filter";
import { CategoryTree } from "@/modules/categories/ui/components/category-tree/category-tree";
import { CATEGORY_ACTIONS } from "@/modules/categories/ui/components/category-actions";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import type { CategoriesMasterDesktopProps } from "../types";

export default function CategoriesMasterViewDesktop({
  items,
  total,
  hasMore,
  isLoadingMore,
  sentinelRef,
  search,
  onSearchChange,
  dateRange,
  onChangeDateRange,
  activeId,
  loadingChildrenIds,
  onFetchChildren,
  onOpenAddModal,
  actionContext,
}: CategoriesMasterDesktopProps) {
  return (
    <div className="flex flex-col gap-4 py-4 w-full">
      {/* Cabeçalho com badge de contagem */}
      <div className="px-4">
        <CategoriesMasterHeader
          totalCount={total}
          onAddClick={onOpenAddModal}
        />
      </div>

      {/* Seção de Filtros: Busca e Seletor de Período */}
      <div className="flex flex-col gap-2.5 px-4">
        <InputGroup className="w-full">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar categoria..."
          />
          {search && (
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-5 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onSearchChange("")}
                aria-label="Limpar busca"
              >
                <X className="size-3" />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CategoriesMasterFilter
              dateRange={dateRange}
              onChangeDateRange={onChangeDateRange}
              isMobile={false}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {items.length} de {total}
          </span>
        </div>
      </div>

      {/* Árvore de Categorias de ponta a ponta */}
      <CategoryTree
        items={items}
        activeId={activeId}
        loadingChildrenIds={loadingChildrenIds}
        onFetchChildren={onFetchChildren}
        renderItemActions={(item: CategoryItem) => (
          <DataTableRowActions
            row={item}
            actions={CATEGORY_ACTIONS}
            context={actionContext}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-6 p-0 text-muted-foreground hover:text-foreground"
                aria-label={`Ações para ${item.name}`}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            }
          />
        )}
      />

      {/* Sentinela de Rolagem Infinita */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex w-full items-center justify-center py-4 px-4"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Carregando mais categorias...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-2 px-4">
          Todas as categorias foram carregadas
        </p>
      )}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <p className="text-sm font-medium text-foreground">
            Nenhuma categoria encontrada
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente buscar com outro termo ou limpe os filtros.
          </p>
        </div>
      )}
    </div>
  );
}
