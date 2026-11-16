import { Repeat } from "lucide-react";
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

export default function EmptyRecurrenceList({
    hasFilters = false,
    onClearFilters,
    className,
}: Props) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Repeat />
                </EmptyMedia>
                <EmptyTitle>Nenhuma recorrência encontrada</EmptyTitle>
                <EmptyDescription>
                    {hasFilters
                        ? "Nenhuma recorrência corresponde à busca ou aos filtros ativos."
                        : "Cadastre uma recorrência para acompanhar seus pagamentos e recebimentos periódicos."}
                </EmptyDescription>
            </EmptyHeader>
            {hasFilters && onClearFilters && (
                <EmptyContent>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs"
                    >
                        Limpar filtros
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
}

