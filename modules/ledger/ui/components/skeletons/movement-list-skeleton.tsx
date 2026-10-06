import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = ["item-1", "item-2", "item-3", "item-4", "item-5", "item-6", "item-7", "item-8", "item-9", "item-10"];

export function MovementListSkeleton({ count = 5 }: { count?: number }) {
    const keys = SKELETON_KEYS.slice(0, Math.min(count, SKELETON_KEYS.length));
    return (
        <div className="w-full flex flex-col divide-y divide-border border-y border-border">
            {keys.map((key) => (
                <div key={key} className="flex w-full flex-col gap-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2.5 flex-1">
                            <Skeleton className="size-8 rounded-lg shrink-0" />
                            <Skeleton className="h-4 w-44" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
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

export default MovementListSkeleton;
