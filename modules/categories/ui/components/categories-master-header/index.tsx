"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CategoriesMasterHeaderProps {
  title?: string;
  totalCount?: number;
  onAddClick?: () => void;
  navigationAction?: React.ReactNode;
  className?: string;
}

export function CategoriesMasterHeader({
  title = "Categorias",
  onAddClick,
  navigationAction,
  className,
}: CategoriesMasterHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between gap-2 pb-1", className)}>
      <div className="flex items-center gap-2 min-w-0">
        {navigationAction}
        <h2 className="text-base font-semibold tracking-tight text-foreground truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="size-7"
          nativeButton={false}
          render={<Link href="/categories/archived" />}
          title="Categorias arquivadas"
          aria-label="Categorias arquivadas"
        >
          <Archive className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={onAddClick}
          title="Nova categoria"
          aria-label="Nova categoria"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </header>
  );
}

export default CategoriesMasterHeader;
