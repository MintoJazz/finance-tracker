import { CalendarClock, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyContractCycleEntryTableProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export function EmptyContractCycleEntryTable({
    hasFilters = false,
    onClearFilters,
    className,
}: EmptyContractCycleEntryTableProps) {
    if (hasFilters) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20", className)}>
                <div className="p-3 bg-muted rounded-full mb-3">
                    <FilterX className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                    Nenhum lançamento encontrado
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Nenhum lançamento correspondeu aos filtros aplicados neste ciclo.
                </p>
                {onClearFilters && (
                    <Button
                        variant="link"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-2 text-xs"
                    >
                        Limpar filtros
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20", className)}>
            <div className="p-3 bg-muted rounded-full mb-3">
                <CalendarClock className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm text-foreground">
                Nenhum lançamento neste ciclo
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Os lançamentos, quitações e repasses deste ciclo serão exibidos aqui.
            </p>
        </div>
    );
}
