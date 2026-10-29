import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { CalendarRange, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyContractCycleListProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

function FilteredEmptyState({
    onClearFilters,
    className,
}: Pick<EmptyContractCycleListProps, "onClearFilters" | "className">) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FilterX className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Nenhum ciclo encontrado</EmptyTitle>
                <EmptyDescription>
                    Nenhum ciclo corresponde aos filtros selecionados.
                </EmptyDescription>
            </EmptyHeader>
            {onClearFilters && (
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

function EmptyState({
    className,
}: Pick<EmptyContractCycleListProps, "className">) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CalendarRange className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Nenhum ciclo registrado</EmptyTitle>
                <EmptyDescription>
                    Este contrato ainda não possui ciclos gerados ou projetados.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

export function EmptyContractCycleList({
    hasFilters = false,
    onClearFilters,
    className,
}: EmptyContractCycleListProps) {
    return (
        <div className="px-4">
            {hasFilters ? (
                <FilteredEmptyState onClearFilters={onClearFilters} className={className} />
            ) : (
                <EmptyState className={className} />
            )}
        </div>
    );
}

export default EmptyContractCycleList;
