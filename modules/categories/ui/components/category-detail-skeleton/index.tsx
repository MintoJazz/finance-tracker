import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface CategoryDetailSkeletonProps {
  className?: string;
}

export function CategoryDetailSkeleton({ className }: CategoryDetailSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 flex flex-col gap-4 animate-pulse",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-1.5 w-1/3">
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}

export default CategoryDetailSkeleton;

