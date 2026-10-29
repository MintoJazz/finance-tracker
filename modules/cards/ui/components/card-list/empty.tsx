import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CreditCard } from "lucide-react";
import { cn } from "cn";

interface Props {
    className?: string;
}

export default function EmptyCardList({ className }: Props) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CreditCard />
                </EmptyMedia>
                <EmptyTitle>Nenhum cartão encontrado</EmptyTitle>
                <EmptyDescription>
                    Ajuste a busca ou os filtros para ver seus cartões.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
