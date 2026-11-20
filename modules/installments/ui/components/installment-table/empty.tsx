import { CalendarClock } from "lucide-react";
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

export default function EmptyInstallmentTable({
    hasFilters = false,
    onClearFilters,
}: Props) {
    return (
        <Empty className="rounded-lg border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CalendarClock />
                </EmptyMedia>
                <EmptyTitle>Nenhum parcelamento encontrado</EmptyTitle>
                <EmptyDescription>
                    {hasFilters
                        ? "Nenhum parcelamento corresponde à busca ou aos filtros ativos."
                        : "Suas compras parceladas aparecerão aqui."}
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
