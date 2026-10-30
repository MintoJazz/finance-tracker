"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type CategoryDetailTabEnum,
  CATEGORY_TAB_METADATA,
} from "@/modules/categories/models/category-tab.schema";
import { cn } from "@/lib/utils";

export interface CategoryDetailTabsProps {
  availableTabs: CategoryDetailTabEnum[];
  activeUrlTabString: string;
  className?: string;
}

export function CategoryDetailTabs({
  availableTabs,
  activeUrlTabString,
  className,
}: CategoryDetailTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (newUrlTab: string) => {
    if (newUrlTab === activeUrlTabString) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newUrlTab);
    router.push(`?${params.toString()}`);
  };

  // Se houver apenas uma ou nenhuma aba disponível, oculta a barra de tabs
  if (availableTabs.length <= 1) {
    return null;
  }

  return (
    <div className={cn("w-full border-b border-border/40", className)}>
      <Tabs
        value={activeUrlTabString}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList
          variant="line"
          className="h-9 w-full justify-start gap-4 sm:gap-6 px-4 overflow-x-auto no-scrollbar"
        >
          {availableTabs.map((tabKey) => {
            const meta = CATEGORY_TAB_METADATA[tabKey];
            if (!meta) return null;

            return (
              <TabsTrigger
                key={tabKey}
                value={meta.urlTabString}
                className="h-9 px-1 text-sm font-medium transition-all data-active:font-semibold shrink-0"
              >
                {meta.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}

export default CategoryDetailTabs;
