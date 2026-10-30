"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTableRowActions } from "@/components/actions/menu";
import { CategoriesMasterHeader } from "@/modules/categories/ui/components/categories-master-header";
import { CategoriesMasterFilter } from "@/modules/categories/ui/components/categories-master-filter";
import { CategoryTree } from "@/modules/categories/ui/components/category-tree/category-tree";
import { CATEGORY_ACTIONS } from "@/modules/categories/ui/components/category-actions";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import type { CategoriesMasterDesktopProps } from "../types";

export default function CategoriesMasterViewDesktop({
  data,
  dateRange,
  onChangeDateRange,
  activeId,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  actionContext,
}: CategoriesMasterDesktopProps) {
  return (
    <div className="flex flex-col gap-4 py-4 w-full">
      {/* Cabeçalho com padding horizontal */}
      <div className="px-4">
        <CategoriesMasterHeader onAddClick={onOpenAddModal} />
      </div>

      {/* Seletor de período com padding horizontal */}
      <div className="px-4">
        <CategoriesMasterFilter
          dateRange={dateRange}
          onChangeDateRange={onChangeDateRange}
          isMobile={false}
        />
      </div>

      {/* Árvore de Categorias de ponta a ponta */}
      <CategoryTree
        items={data.items}
        activeId={activeId}
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

      {/* Modal Desktop para Nova Categoria (Dialog) */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && onCloseAddModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para agrupar e organizar suas movimentações orçamentárias.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input id="category-name" placeholder="Ex: Educação, Investimentos..." autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCloseAddModal}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                onCloseAddModal();
              }}
            >
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
