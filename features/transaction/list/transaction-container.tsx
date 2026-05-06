"use client"

import { STATUS_CONFIG } from "@/constants/status"
import { TransactionStatus } from "@/generated/prisma/browser"
import ShareSwitcher from "../share-switcher"
import StatusBadge from "../status-badge"
import TransactionMenu from "../transaction-menu"
import TransactionCard, { TransactionCardInfo, TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight } from "./transaction-card"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionDetails } from "../../../types/database"
import { useManager } from "@/hooks/use-manager"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Receipt } from "lucide-react"
// import { useDraftList } from "@/hooks/use-draft-list"
import { ActionSet } from "@/types/action-set"
import { useSelection } from "@/hooks/use-selection"

interface Props {
    transactions: TransactionDetails[]
}

export default function TransactionContainer({ transactions }: Props) {
    const { onDelete, onEdit } = useManager<TransactionDetails>()
    const { select, selected } = useSelection()
    // const {} = useDraftList<TransactionDetails>();

    if (transactions.length === 0) {
        return (
            <Empty>
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
        )
    }

    const actions: ActionSet<TransactionDetails>[] = [
        {
            children: "Editar",
            onAction: onEdit,
        },
        {
            children: "Excluir",
            onAction: onDelete,
            variant: "destructive",
        }
    ]

    const onStatusChange = (status: TransactionStatus) => {
        console.log('status mudou', status)
    }

    return <div className="flex flex-col gap-2">
        {
            transactions.map(transaction => {
                const statusConfig = STATUS_CONFIG[transaction.status]

                return <TransactionCard key={transaction.id}>
                    <TransactionCardInfo transaction={transaction} />
                    <TransactionCardFooter>
                        <TransactionCardFooterLeft>
                            <Checkbox checked={selected.includes(transaction.id)} onCheckedChange={() => select(transaction.id)}/>
                            <ShareSwitcher  />
                        </TransactionCardFooterLeft>
                        <TransactionCardFooterRight>
                            <StatusBadge statusConfig={statusConfig} current={transaction.status} onClick={onStatusChange} />
                            <TransactionMenu actions={actions} transaction={transaction} />
                        </TransactionCardFooterRight>
                    </TransactionCardFooter>
                </TransactionCard>
            })
        }
    </div>
}