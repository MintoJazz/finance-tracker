// modules/planning/ui/components/commitment-cycle-table/empty.tsx
import { CalendarCheck2, RotateCcw } from "lucide-react";
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

export default function EmptyCommitmentCycleTable({
    hasFilters,
    onClearFilters,
}: Props) {
    return (
        <Empty className="rounded-xl border bg-card/50 py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CalendarCheck2 className="size-5 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle className="text-base font-semibold">
                    {hasFilters
                        ? "Nenhum compromisso encontrado"
                        : "Sem compromissos neste período"}
                </EmptyTitle>
                <EmptyDescription className="text-sm text-muted-foreground max-w-sm">
                    {hasFilters
                        ? "Não encontramos faturas ou obrigações que correspondam aos filtros selecionados."
                        : "Não há faturas ou contratos com vencimento programado para o intervalo selecionado."}
                </EmptyDescription>
            </EmptyHeader>
            {hasFilters && onClearFilters && (
                <EmptyContent>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="gap-1.5"
                    >
                        <RotateCcw className="size-3.5" />
                        Restaurar filtros padrão
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
}