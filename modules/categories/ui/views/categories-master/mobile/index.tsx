"use client";

import * as React from "react";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoriesMasterHeader } from "@/modules/categories/ui/components/categories-master-header";
import { CategoriesMasterFilter } from "@/modules/categories/ui/components/categories-master-filter";
import { CategoryTree } from "@/modules/categories/ui/components/category-tree/category-tree";
import { CategoryActionsDrawer } from "@/modules/categories/ui/components/category-actions-drawer";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import type { CategoriesMasterMobileProps } from "../types";

export default function CategoriesMasterViewMobile({
  data,
  dateRange,
  onChangeDateRange,
  activeId,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  actionContext,
  activeCategoryForActions,
  isActionsDrawerOpen,
  onOpenActions,
  onCloseActions,
  onCloseMaster,
}: CategoriesMasterMobileProps) {
  return (
    <div className="flex flex-col gap-4 py-4 w-full pb-10">
      {/* Cabeçalho com botão de retorno/fechar master no mobile */}
      <div className="px-4">
        <CategoriesMasterHeader
          onAddClick={onOpenAddModal}
          navigationAction={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onCloseMaster}
              className="size-7 -ml-1 text-muted-foreground hover:text-foreground"
              aria-label="Voltar para o detalhe"
            >
              <ChevronLeft className="size-4" />
            </Button>
          }
        />
      </div>

      {/* Seletor de período com Drawer inferior */}
      <div className="px-4">
        <CategoriesMasterFilter
          dateRange={dateRange}
          onChangeDateRange={onChangeDateRange}
          isMobile={true}
        />
      </div>

      {/* Árvore de Categorias de ponta a ponta */}
      <CategoryTree
        items={data.items}
        activeId={activeId}
        renderItemActions={(item: CategoryItem) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenActions(item);
            }}
            aria-label={`Ações para ${item.name}`}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        )}
      />

      {/* Gaveta de Ações Mobile (Bottom Sheet) */}
      <CategoryActionsDrawer
        category={activeCategoryForActions}
        open={isActionsDrawerOpen}
        onOpenChange={(open: boolean) => !open && onCloseActions()}
        context={actionContext}
      />

      {/* Drawer Mobile para Nova Categoria */}
      <Drawer
        open={isAddModalOpen}
        onOpenChange={(open) => !open && onCloseAddModal()}
        showSwipeHandle
      >
        <DrawerContent className="p-4">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle>Nova Categoria</DrawerTitle>
            <DrawerDescription>
              Crie uma nova categoria para organizar suas movimentações.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 py-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile-category-name">Nome da Categoria</Label>
              <Input
                id="mobile-category-name"
                placeholder="Ex: Educação, Lazer..."
                autoFocus
              />
            </div>
          </div>
          <DrawerFooter className="px-0">
            <Button
              type="button"
              onClick={() => {
                onCloseAddModal();
              }}
            >
              Criar Categoria
            </Button>
            <Button type="button" variant="outline" onClick={onCloseAddModal}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
