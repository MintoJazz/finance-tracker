"use client";

import * as React from "react";
import { Archive, ArchiveRestore, CornerDownRight, Folder, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useArchivedCategoriesList } from "./hook";
import type { ArchivedCategoriesListProps } from "./types";

export function ArchivedCategoriesList({
  initialItems,
  onRestore,
  className,
}: ArchivedCategoriesListProps) {
  const {
    items,
    isLoading,
    error,
    reload,
    handleRestoreCategory,
    handleRestoreSubcategory,
  } = useArchivedCategoriesList({
    initialItems,
    onRestore,
  });

  // Estado de carregamento com skeleton
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3.5", className)}>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border bg-card p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-xs" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
              <Skeleton className="size-7 rounded-md" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between pl-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-3.5 rounded-xs" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <Skeleton className="size-6 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Estado de erro com opção de recarregar
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground border border-destructive/20 rounded-lg bg-destructive/5">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar categorias arquivadas
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void reload()}
          className="gap-1.5 mt-1"
        >
          <RefreshCw className="size-3.5" />
          <span>Tentar novamente</span>
        </Button>
      </div>
    );
  }

  // Um grupo com archived: false e sem filhas não é renderizado
  const visibleGroups = items.filter(
    (group) => group.archived || group.children.length > 0
  );

  if (visibleGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
        <Archive className="size-8 stroke-[1.5] text-muted-foreground/60" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Nenhuma categoria arquivada</p>
          <p className="text-xs text-muted-foreground">
            Não há categorias ou subcategorias arquivadas para exibir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      {visibleGroups.map((group) => {
        const isArchived = group.archived;
        const hasChildren = group.children.length > 0;

        return (
          <div
            key={group.id}
            className={cn(
              "overflow-hidden rounded-lg border transition-colors",
              isArchived
                ? "border-border bg-card shadow-xs"
                : "border-dashed border-border/80 bg-muted/10"
            )}
          >
            {/* Cabeçalho do grupo */}
            <div
              className={cn(
                "flex items-center justify-between gap-3 px-3.5 py-2.5",
                isArchived ? "bg-muted/30" : "bg-transparent"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Folder
                  className={cn(
                    "size-4 shrink-0",
                    isArchived ? "text-muted-foreground" : "text-muted-foreground/60"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    isArchived ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {group.name}
                </span>
                {isArchived ? (
                  <Badge variant="secondary" className="text-[10px] font-normal shrink-0">
                    Categoria arquivada
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal text-muted-foreground border-border/70 shrink-0"
                  >
                    Categoria ativa
                  </Badge>
                )}
              </div>

              {/* Botão de restauração apenas se a categoria estiver arquivada */}
              {isArchived && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Restaurar categoria"
                  title="Restaurar categoria"
                  onClick={() => handleRestoreCategory(group)}
                >
                  <ArchiveRestore className="size-4" />
                </Button>
              )}
            </div>

            {/* Linhas de subcategorias conectadas visualmente */}
            {hasChildren && (
              <div className="divide-y divide-border border-t border-border">
                {group.children.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-3 py-2 px-3.5 pl-7 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CornerDownRight className="size-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {sub.name}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="Restaurar subcategoria"
                      title="Restaurar subcategoria"
                      onClick={() => handleRestoreSubcategory(group, sub)}
                    >
                      <ArchiveRestore className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export * from "./types";
export * from "./hook";
