"use client"

import { STATUS_CONFIG } from "@/constants/status"
import { Transaction, TransactionStatus } from "@/generated/prisma/browser"
import ShareSwitcher from "../share-switcher"
import StatusBadge from "../status-badge"
import TransactionMenu, { ActionSet } from "../transaction-menu"
import TransactionCard, { TransactionCardInfo, TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight } from "./transaction-card"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionDetails } from "../types/database"
import { useManager } from "@/hooks/use-manager"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Receipt } from "lucide-react"

interface Props {
    transactions: TransactionDetails[]
}

export default function TransactionContainer({ transactions }: Props) {
    const { onDelete, onEdit } = useManager<Transaction>();

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

    const actions: ActionSet[] = [
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

    return <div>
        {
            transactions.map(transaction => {
                const statusConfig = STATUS_CONFIG[transaction.status]

                return <TransactionCard key={transaction.id}>
                    <TransactionCardInfo transaction={transaction} />
                    <TransactionCardFooter>
                        <TransactionCardFooterLeft>
                            <Checkbox />
                            <ShareSwitcher />
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