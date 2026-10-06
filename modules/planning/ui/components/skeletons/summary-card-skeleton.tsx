import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardSkeleton() {
    return (
        <Card className="w-full">
            <div className="relative w-full h-16 border-b border-border/40 bg-muted/20">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
                    <Skeleton className="size-12 sm:size-13 rounded-2xl bg-muted shadow-sm" />
                </div>
            </div>
            <CardContent className="flex flex-col gap-4 pt-8 px-4 sm:px-4.5 pb-4">
                <div className="flex flex-col items-center justify-center gap-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="size-3.5 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-32 mt-0.5" />
                    <Skeleton className="h-1.5 w-full rounded-full mt-1" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default SummaryCardSkeleton;