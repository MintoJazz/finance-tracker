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
import { cn } from "@/lib/utils";

interface Props {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export default function EmptyInstallmentList({
    hasFilters = false,
    onClearFilters,
    className,
}: Props) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CalendarClock />
                </EmptyMedia>
                <EmptyTitle>Nenhum parcelamento encontrado</EmptyTitle>
                <EmptyDescription>
                    {hasFilters
                        ? "Nenhum parcelamento corresponde à busca ou aos filtros ativos."
                        : "Suas compras parceladas aparecerão aqui para você acompanhar o progresso de cada uma."}
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
