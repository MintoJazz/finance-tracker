"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { TabBasicData } from "@/modules/categories/ui/actions/get-tab-content.action";

export interface CategoryTabPlaceholderProps {
  data: TabBasicData;
  viewport: "desktop" | "mobile";
}

export function CategoryTabPlaceholder({ data, viewport }: CategoryTabPlaceholderProps) {
  return (
    <div className="w-full rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
        <div>
          <h3 className="text-base font-medium text-foreground tracking-tight">
            {data.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Escopo: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{data.scope}</code>
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          conteúdo da aba ativa (Suspense + skeleton) • {viewport}
        </span>
      </div>

      {/* Skeletons representativos para simular o layout do conteúdo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function useTabPlaceholder(data: TabBasicData) {
  return { data };
}

export function TabPlaceholderDesktop(props: { data: TabBasicData }) {
  return <CategoryTabPlaceholder data={props.data} viewport="desktop" />;
}

export function TabPlaceholderMobile(props: { data: TabBasicData }) {
  return <CategoryTabPlaceholder data={props.data} viewport="mobile" />;
}