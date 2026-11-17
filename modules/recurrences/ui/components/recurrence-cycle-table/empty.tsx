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

interface Props {
    hasFilters?: boolean;
    onClearFilters?: () => void;
}

export default function EmptyRecurrenceCycleTable({
    hasFilters = false,
    onClearFilters,
}: Props) {
    return (
        <Empty className="rounded-xl border border-border/80 py-8">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CalendarRange className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Nenhum ciclo encontrado</EmptyTitle>
                <EmptyDescription>
                    {hasFilters
                        ? "Nenhum ciclo corresponde aos filtros ou busca ativos neste horizonte."
                        : "Não há ciclos registrados para esta recorrência no período selecionado."}
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

