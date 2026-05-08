"use client"

import { STATUS_CONFIG } from "@/features/transaction/status-badge/status-config"
import ShareSwitcher from "../share-switcher"
import StatusBadge from "../status-badge"
import TransactionMenu from "../transaction-menu"
import TransactionCard, { TransactionCardInfo, TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight } from "./transaction-card"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionDetails } from "../../../types/database"
import TransactionEmpty from "./transaction-empty"
import { useTransactionFeatures } from "./use-transaction-features"

interface Props {
    transactions: TransactionDetails[]
}

export default function TransactionContainer({ transactions }: Props) {
    const { items, actions, onStatusChange, isSelected, select } = useTransactionFeatures(transactions)

    return <div className="flex flex-col gap-2">
        {(items) ? items.map(transaction => {
            const statusConfig = STATUS_CONFIG[transaction.status]
            const originalTransaction = transactions.find(t => t.id === transaction.id) || transaction;

            return <TransactionCard key={transaction.id}>
                <TransactionCardInfo transaction={transaction} />
                <TransactionCardFooter>
                    <TransactionCardFooterLeft>
                        <Checkbox checked={isSelected(transaction.id)} onCheckedChange={() => select(transaction.id)} />
                        <ShareSwitcher />
                    </TransactionCardFooterLeft>
                    <TransactionCardFooterRight>
                        <StatusBadge statusConfig={statusConfig} current={transaction.status} 
                            onClick={(status) => onStatusChange(transaction.id, status, originalTransaction)} />
                        <TransactionMenu actions={actions} transaction={transaction} />
                    </TransactionCardFooterRight>
                </TransactionCardFooter>
            </TransactionCard>
        }) : <TransactionEmpty />
        }
    </div>
}