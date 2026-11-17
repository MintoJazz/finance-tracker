import React from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface Props {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export default function EmptyRecurrenceCycleList({
    hasFilters = false,
    onClearFilters,
    className,
}: Props) {
    return (
        <Empty className={cn("rounded-xl border border-border/80 py-8 my-2", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CalendarRange className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Nenhum ciclo encontrado</EmptyTitle>
                <EmptyDescription>
                    {hasFilters
                        ? "Nenhum ciclo corresponde aos filtros ativos."
                        : "Não há ciclos registrados para esta recorrência no período."}
                </EmptyDescription>
            </EmptyHeader>
            {hasFilters && onClearFilters && (
                <EmptyContent>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs cursor-pointer"
                    >
                        Limpar filtros
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
}
