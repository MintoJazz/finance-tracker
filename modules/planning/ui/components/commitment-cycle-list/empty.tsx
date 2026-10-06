// modules/planning/ui/components/commitment-cycle-list/empty.tsx
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

export default function EmptyCommitmentCycleList({
    hasFilters,
    onClearFilters,
}: Props) {
    return (
        <div className="px-4">
            <Empty className="rounded-xl border bg-card/50 py-10">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CalendarCheck2 className="size-5 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle className="text-base font-semibold">
                        {hasFilters
                            ? "Nenhum compromisso encontrado"
                            : "Sem compromissos no período"}
                    </EmptyTitle>
                    <EmptyDescription className="text-xs text-muted-foreground max-w-xs">
                        {hasFilters
                            ? "Nenhuma obrigação corresponde aos filtros selecionados."
                            : "Não há faturas ou contratos com vencimento programado para este período."}
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
                            Limpar filtros
                        </Button>
                    </EmptyContent>
                )}
            </Empty>
        </div>
    );
}