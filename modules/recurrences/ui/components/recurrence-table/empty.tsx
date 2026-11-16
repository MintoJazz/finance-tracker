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

interface Props {
    hasFilters?: boolean;
    onClearFilters?: () => void;
}

export default function EmptyRecurrenceTable({
    hasFilters = false,
    onClearFilters,
}: Props) {
    return (
        <Empty className="rounded-lg border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Repeat />
                </EmptyMedia>
                <EmptyTitle>Nenhuma recorrência encontrada</EmptyTitle>
                <EmptyDescription>
                    {hasFilters
                        ? "Nenhuma recorrência corresponde à busca ou aos filtros ativos."
                        : "Ajuste a busca ou os filtros para ver suas recorrências."}
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

