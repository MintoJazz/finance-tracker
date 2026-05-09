import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Receipt } from "lucide-react";

export default function TransactionEmpty() {
    return <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Receipt />
            </EmptyMedia>
            <EmptyTitle>Nenhuma transação</EmptyTitle>
            <EmptyDescription>
                Você ainda não possui transações registradas.
            </EmptyDescription>
        </EmptyHeader>
    </Empty>
}