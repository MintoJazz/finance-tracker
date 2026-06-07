"use client"

import StatusBadge from "./status-badge"
import TransactionMenu from "./transaction-menu"
import TransactionCard, { TransactionCardInfo, TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight } from "./transaction-card"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionDetails } from "../../../types/database"
import TransactionEmpty from "./transaction-empty"
import { useTransactionFeatures } from "../hooks/use-transaction-features"
import { Bucket } from "@/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import CreateTransaction from "./create-transaction-dialog"
import { ACTION_THEMES } from "../themes/action-styles"

interface Props {
    transactions: TransactionDetails[]
    buckets: Bucket[]
}

export default function TransactionContainer({ transactions, buckets }: Props) {
    const { items, actions, getStatusBadgeProps, getCheckboxProps, getAction, createDialogProps, onAddClick } = useTransactionFeatures(transactions)

    return <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
            <Button className="flex-1" onClick={() => onAddClick(false)} ><Minus /> Pagar</Button>
            <Button className="flex-1" onClick={() => onAddClick(true)} ><Plus /> Receber</Button>
        </div>

        {(items) ? items.map(transaction => {
            const actionConfig = ACTION_THEMES[getAction(transaction.id)]

            return <TransactionCard key={transaction.id} actionTheme={actionConfig}>
                <TransactionCardInfo transaction={transaction} />
                <TransactionCardFooter actionTheme={actionConfig}>
                    <TransactionCardFooterLeft>
                        <Checkbox {...getCheckboxProps(transaction.id)} />
                    </TransactionCardFooterLeft>
                    <TransactionCardFooterRight>
                        <StatusBadge {...getStatusBadgeProps(transaction)} />
                        <TransactionMenu actions={actions} transaction={transaction} />
                    </TransactionCardFooterRight>
                </TransactionCardFooter>
            </TransactionCard>
        }) : <TransactionEmpty />}

        <CreateTransaction buckets={buckets} {...createDialogProps} />
    </div>
}
