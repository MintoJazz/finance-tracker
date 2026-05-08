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
import { useDraftList } from "@/hooks/use-draft-list"
import { useSelection } from "@/hooks/use-selection"
import TransactionEmpty from "./transaction-empty"
import { ActionSet } from "@/types/action-set"

interface Props {
    transactions: TransactionDetails[]
}

export default function TransactionContainer({ transactions }: Props) {
    const { onDelete, onEdit } = useManager<TransactionDetails>()
    const { select, selected } = useSelection()
    const { edit, items } = useDraftList<TransactionDetails>(transactions);

    const onStatusChange = (id: number, status: TransactionStatus, transaction: TransactionDetails) => {
        edit(id, { status }, transaction)
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
        },
    ]

    return <div className="flex flex-col gap-2">
        {(items) ? items.map(transaction => {
            const statusConfig = STATUS_CONFIG[transaction.status]
            const originalTransaction = transactions.find(t => t.id === transaction.id) || transaction;

            return <TransactionCard key={transaction.id}>
                <TransactionCardInfo transaction={transaction} />
                <TransactionCardFooter>
                    <TransactionCardFooterLeft>
                        <Checkbox checked={selected.includes(transaction.id)} onCheckedChange={() => select(transaction.id)} />
                        <ShareSwitcher />
                    </TransactionCardFooterLeft>
                    <TransactionCardFooterRight>
                        <StatusBadge statusConfig={statusConfig} current={transaction.status} onClick={(status) => onStatusChange(transaction.id, status, originalTransaction)} />
                        <TransactionMenu actions={actions} transaction={transaction} />
                    </TransactionCardFooterRight>
                </TransactionCardFooter>
            </TransactionCard>
        }) : <TransactionEmpty />
        }
    </div>
}