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
import { cn } from "@/lib/utils";

interface EmptyWalletMovementListProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

function FilteredEmptyState({
    onClearFilters,
    className,
}: Pick<EmptyWalletMovementListProps, "onClearFilters" | "className">) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FilterX className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Nenhum resultado</EmptyTitle>
                <EmptyDescription>
                    Nenhuma movimentação corresponde aos filtros aplicados.
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
}: Pick<EmptyWalletMovementListProps, "className">) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ArrowLeftRight className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Nenhuma movimentação</EmptyTitle>
                <EmptyDescription>
                    Esta carteira ainda não possui lançamentos no extrato.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

export function EmptyWalletMovementList({
    hasFilters = false,
    onClearFilters,
    className,
}: EmptyWalletMovementListProps) {
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

export default EmptyWalletMovementList;