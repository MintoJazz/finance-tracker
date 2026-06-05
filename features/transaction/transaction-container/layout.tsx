"use client"

import { STATUS_CONFIG } from "@/features/transaction/status-badge/status-config"
import ShareSwitcher from "../share-switcher"
import StatusBadge from "../status-badge"
import TransactionMenu from "../transaction-menu"
import TransactionCard, { TransactionCardInfo, TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight } from "."
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionDetails } from "../../../types/database"
import TransactionEmpty from "./transaction-empty"
import { useTransactionFeatures } from "./hook"
import { ACTIONS_CONFIG } from "./action-config"
import { OPERATION_CONFIG } from "./operation-config"
import { SWITCHER_STYLE } from "../share-switcher/switcher-style"
import CreateTransaction from "../transaction-form/create-form"
import { Bucket } from "@/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface Props {
    transactions: TransactionDetails[]
    buckets: Bucket[]
}

export default function TransactionContainer({ transactions, buckets }: Props) {
    const { items, actions, onStatusChange, onIsSharedChange, isSelected, select, getAction, createDialogProps, onAddClick } = useTransactionFeatures(transactions)

    return <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
            <Button className="flex-1" onClick={() => onAddClick(false)} ><Minus /> Pagar</Button>
            <Button className="flex-1" onClick={() => onAddClick(true)} ><Plus /> Receber</Button>
        </div>

        {(items) ? items.map(transaction => {
            const statusConfig = STATUS_CONFIG[transaction.status]
            const operationConfig = OPERATION_CONFIG[transaction.type]
            const actionConfig = ACTIONS_CONFIG[getAction(transaction.id)]
            const isSharedClassName = SWITCHER_STYLE[Number(transaction.isShared)]
            const originalTransaction = transactions.find(t => t.id === transaction.id) || transaction;

            return <TransactionCard key={transaction.id} actionConfig={actionConfig}>
                <TransactionCardInfo transaction={transaction} operationConfig={operationConfig} />
                <TransactionCardFooter actionConfig={actionConfig}>
                    <TransactionCardFooterLeft>
                        <Checkbox checked={isSelected(transaction.id)} onCheckedChange={() => select(transaction.id)} />
                        <ShareSwitcher onClick={(isShared) => onIsSharedChange(transaction.id, isShared, originalTransaction)} isShared={transaction.isShared} className={isSharedClassName} />
                    </TransactionCardFooterLeft>
                    <TransactionCardFooterRight>
                        <StatusBadge statusConfig={statusConfig} current={transaction.status}
                            onClick={(status) => onStatusChange(transaction.id, status, originalTransaction)} />
                        <TransactionMenu actions={actions} transaction={transaction} />
                    </TransactionCardFooterRight>
                </TransactionCardFooter>
            </TransactionCard>
        }) : <TransactionEmpty />}

        <CreateTransaction buckets={buckets} {...createDialogProps} />
    </div>
}