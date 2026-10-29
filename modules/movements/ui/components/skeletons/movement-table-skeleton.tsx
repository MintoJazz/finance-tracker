import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6", "row-7", "row-8", "row-9", "row-10"];

export function MovementTableSkeleton({ rows = 5 }: { rows?: number }) {
    const keys = SKELETON_KEYS.slice(0, Math.min(rows, SKELETON_KEYS.length));
    return (
        <div className="w-full space-y-3">
            <div className="rounded-md border overflow-hidden">
                {/* Header da tabela */}
                <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                </div>

                {/* Linhas da tabela */}
                <div className="divide-y divide-border">
                    {keys.map((key) => (
                        <div key={key} className="flex items-center justify-between px-4 py-3.5">
                            <Skeleton className="h-4 w-20" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Paginação skeleton */}
            <div className="flex items-center justify-between px-2 py-2">
                <Skeleton className="h-4 w-32 hidden sm:block" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-40" />
                </div>
            </div>
        </div>
    );
}
