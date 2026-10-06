// modules/planning/ui/components/skeletons/cycle-list-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS = ["i1", "i2", "i3", "i4", "i5"];

export function CycleListSkeleton() {
    return (
        <div className="w-full flex flex-col divide-y divide-border border-y border-border">
            {ITEMS.map((key) => (
                <div key={key} className="flex flex-col gap-2.5 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <Skeleton className="size-8 rounded-md shrink-0" />
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="size-7 rounded-md shrink-0" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}