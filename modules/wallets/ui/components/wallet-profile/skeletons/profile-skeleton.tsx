import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const QUICK_ACTION_SKELETON_KEYS = ["qa-1", "qa-2", "qa-3"];

export function ProfileSkeleton() {
    return (
        <Card className="w-full">
            {/* 1. Banner superior com o avatar centralizado na linha de divisão */}
            <div className="relative w-full h-16 border-b border-border/40 bg-muted/20">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
                    <Skeleton className="size-12 sm:size-13 rounded-2xl bg-muted shadow-sm" />
                </div>
            </div>

            {/* 2. Corpo do card no mesmo container */}
            <CardContent className="flex flex-col gap-4 pt-8 px-4 sm:px-4.5 pb-4">
                {/* Nome e subtítulo */}
                <div className="flex flex-col items-center justify-center gap-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>

                {/* Linha divisória */}
                <div className="border-t border-border/40" />

                {/* Saldo */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="size-3.5 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-32 mt-0.5" />
                </div>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-3 gap-2 w-full">
                    {QUICK_ACTION_SKELETON_KEYS.map((key) => (
                        <Skeleton key={key} className="h-15.5 w-full rounded-2xl" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default ProfileSkeleton;
