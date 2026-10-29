import { Skeleton } from "@/components/ui/skeleton";

const CYCLE_SKELETON_KEYS = ["cycle-skel-1", "cycle-skel-2", "cycle-skel-3", "cycle-skel-4"];

export function ContractCycleListSkeleton() {
    return (
        <div className="w-full flex flex-col divide-y divide-border border-y border-border">
            {CYCLE_SKELETON_KEYS.map((key) => (
                <div key={key} className="flex flex-col gap-2 p-4 bg-background">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ContractCycleListSkeleton;
