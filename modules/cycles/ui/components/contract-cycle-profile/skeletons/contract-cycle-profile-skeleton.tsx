import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ContractCycleProfileSkeleton() {
    return (
        <main className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 md:p-6 lg:p-8 lg:py-4 min-w-0 animate-pulse">
            {/* 1. Resumo do Ciclo Card Skeleton */}
            <Card className="overflow-hidden bg-card shadow-2xs w-full">
                {/* Cabeçalho do Card (Navegador) */}
                <CardHeader className="flex flex-row items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-muted/30 border-b">
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                    <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                </CardHeader>

                {/* Corpo do Card (Estilo Klarna, centralizado) */}
                <CardContent className="flex flex-col items-center text-center p-5 sm:p-7 gap-5 w-full">
                    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-4.5 sm:gap-5">
                        {/* Nome do contrato */}
                        <Skeleton className="h-4 w-40" />

                        {/* Rótulo + Valor grande */}
                        <div className="flex flex-col items-center gap-1.5">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-9 w-44" />
                        </div>

                        {/* Linha de apoio */}
                        <Skeleton className="h-3 w-64 max-w-full" />

                        {/* Barra de progresso */}
                        <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-2">
                            <Skeleton className="h-2 w-full rounded-full" />
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>

                        {/* Quick actions em row */}
                        <div className="w-full max-w-sm sm:max-w-md flex justify-center gap-2 pt-1">
                            <Skeleton className="h-10 flex-1 max-w-32 rounded-lg" />
                            <Skeleton className="h-10 flex-1 max-w-32 rounded-lg" />
                            <Skeleton className="h-10 flex-1 max-w-32 rounded-lg" />
                        </div>
                    </div>
                </CardContent>
            </Card>

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
        </main>
    );
}

export default ContractCycleProfileSkeleton;
