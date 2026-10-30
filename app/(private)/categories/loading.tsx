import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
        </div>
    )
}
