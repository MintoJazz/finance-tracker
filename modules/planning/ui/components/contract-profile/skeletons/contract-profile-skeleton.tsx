import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const QUICK_ACTION_SKELETON_KEYS = ["cqa-1", "cqa-2", "cqa-3"];

export function ContractProfileSkeleton() {
    return (
        <Card className="w-full">
            <div className="relative w-full h-16 border-b border-border/40 bg-muted/20">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
                    <Skeleton className="size-12 sm:size-13 rounded-2xl bg-muted shadow-sm" />
                </div>
            </div>
            <CardContent className="flex flex-col gap-4 pt-8 px-4 sm:px-4.5 pb-4">
                <div className="flex flex-col items-center justify-center gap-1.5">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-14 rounded-full" />
                        <Skeleton className="h-4 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-32 mt-0.5" />
                </div>
                <div className="border-t border-border/40" />
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="size-3.5 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-36 mt-0.5" />
                    <Skeleton className="h-1.5 w-full rounded-full mt-1.5" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full pt-1">
                    {QUICK_ACTION_SKELETON_KEYS.map((key) => (
                        <div key={key} className="flex flex-col items-center gap-1 min-w-0 w-full">
                            <Skeleton className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl" />
                            <Skeleton className="h-2.5 w-10" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default ContractProfileSkeleton;
