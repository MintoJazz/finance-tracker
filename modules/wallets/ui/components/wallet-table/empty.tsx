import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Wallet } from "lucide-react";

export default function EmptyWalletTable() {
    return <Empty className="rounded-lg border">
        <EmptyHeader>
            <EmptyMedia variant="icon"><Wallet /></EmptyMedia>
            <EmptyTitle>Nenhuma carteira encontrada</EmptyTitle>
            <EmptyDescription>Ajuste a busca ou os filtros para ver suas carteiras.</EmptyDescription>
        </EmptyHeader>
    </Empty>
}