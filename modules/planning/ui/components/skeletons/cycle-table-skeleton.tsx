// modules/planning/ui/components/skeletons/cycle-table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["r1", "r2", "r3", "r4", "r5", "r6"];

export function CycleTableSkeleton() {
    return (
        <div className="w-full rounded-md border bg-card">
            <div className="divide-y divide-border">
                {ROWS.map((key) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                        <Skeleton className="h-4 w-20 shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Skeleton className="size-7 rounded-md shrink-0" />
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Skeleton className="h-4 w-44" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-24 shrink-0" />
                        <Skeleton className="size-7 rounded-md shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}