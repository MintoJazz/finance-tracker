import { CreditCard, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyCreditMovementTableProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
}

export function EmptyCreditMovementTable({
    hasFilters = false,
    onClearFilters,
}: EmptyCreditMovementTableProps) {
    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20">
                <div className="p-3 bg-muted rounded-full mb-3">
                    <FilterX className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-sm text-foreground">
                    Nenhum lançamento encontrado
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Nenhum lançamento correspondeu aos filtros aplicados na fatura.
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
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20">
            <div className="p-3 bg-muted rounded-full mb-3">
                <CreditCard className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm text-foreground">
                Nenhum lançamento nesta fatura
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                As compras e lançamentos deste ciclo do cartão serão exibidos aqui.
            </p>
        </div>
    );
}
