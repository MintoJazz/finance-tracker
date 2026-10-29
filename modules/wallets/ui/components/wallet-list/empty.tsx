import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Wallet } from "lucide-react";
import { cn } from "cn";

interface Props {
    className?: string;
}

export default function EmptyWalletList({ className }: Props) {
    return (
        <Empty className={cn("rounded-lg border bg-card p-6", className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Wallet />
                </EmptyMedia>
                <EmptyTitle>Nenhuma carteira encontrada</EmptyTitle>
                <EmptyDescription>
                    Ajuste a busca ou os filtros para ver suas carteiras.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
