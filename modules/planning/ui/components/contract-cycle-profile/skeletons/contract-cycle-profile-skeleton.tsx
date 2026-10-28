import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractCycleProfileSkeleton() {
    return (
        <main className="w-full max-w-2xl mx-auto flex flex-col gap-4.5 p-4 md:p-6 min-w-0 animate-pulse">
            {/* 1. Resumo do Ciclo Skeleton */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-2xs w-full">
                {/* Navegador */}
                <div className="flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                </div>

                {/* Valor em destaque + Progresso */}
                <div className="flex flex-col gap-3 py-1">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-8 w-40" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>

                {/* Quick actions */}
                <div className="pt-2 border-t border-border/50 grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <Skeleton className="h-9 w-12 rounded-xl" />
                            <Skeleton className="h-2.5 w-10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Extrato do Ciclo Skeleton */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-2xs w-full flex flex-col p-4 gap-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-8 rounded-full" />
                </div>
                <div className="flex flex-col gap-3 pt-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between gap-3 py-2 border-b border-border/30 last:border-0"
                        >
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Sobre este ciclo Skeleton */}
            <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-2xs w-full flex flex-col gap-3">
                <Skeleton className="h-4 w-28" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                </div>
            </div>
        </main>
    );
}

export default ContractCycleProfileSkeleton;
