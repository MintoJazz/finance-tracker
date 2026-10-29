import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { ArrowLeftRight, FilterX } from "lucide-react";

interface EmptyWalletMovementTableProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
}

export function EmptyWalletMovementTable({
    hasFilters = false,
    onClearFilters,
}: EmptyWalletMovementTableProps) {
    if (hasFilters) {
        return (
            <Empty className="rounded-lg border bg-card/40 p-8">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FilterX className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Nenhum resultado encontrado</EmptyTitle>
                    <EmptyDescription>
                        Nenhuma movimentação corresponde aos filtros selecionados. Tente ajustar os
                        critérios ou limpar os filtros.
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

    return (
        <Empty className="rounded-lg border bg-card/40 p-8">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ArrowLeftRight className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Nenhuma movimentação registrada</EmptyTitle>
                <EmptyDescription>
                    Esta carteira ainda não possui entradas ou saídas em seu extrato.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
