import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { CreditCard } from "lucide-react";

export default function EmptyCardTable() {
    return (
        <Empty className="rounded-lg border">
            <EmptyHeader>
                <EmptyMedia variant="icon"><CreditCard /></EmptyMedia>
                <EmptyTitle>Nenhum cartão encontrado</EmptyTitle>
                <EmptyDescription>Ajuste a busca ou os filtros para ver seus cartões.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
