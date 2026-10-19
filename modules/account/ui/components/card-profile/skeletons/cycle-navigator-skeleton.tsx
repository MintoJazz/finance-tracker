import { Skeleton } from "@/components/ui/skeleton";

export function CycleNavigatorSkeleton() {
    return (
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-44" />
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
            <Skeleton className="size-8 rounded-lg shrink-0" />
        </div>
    );
}

export default CycleNavigatorSkeleton;