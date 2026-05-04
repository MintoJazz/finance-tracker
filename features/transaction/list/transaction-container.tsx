"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { STATUS_CONFIG } from "@/constants/status"
import { Transaction } from "@/generated/prisma/browser"
import { ComponentProps } from "react"
import ShareSwitcher from "../share-switcher"
import StatusBadge from "../status-badge"
import TransactionMenu from "../transaction-menu"
import TransactionCard, { TransactionCardInfo, TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight } from "./transaction-card"
import { Checkbox } from "@/components/ui/checkbox"

export default function TransactionContainer() {
    const transaction: Transaction = {
        description: 'TesteDescrição',
        status: "PENDING",
        date: new Date(),
        amount: 5000,
        workspaceId: -1,
        id: -1
    }

    const actions: ComponentProps<typeof DropdownMenuItem>[] = [
        {
            children: "Editar",
            onClick: () => console.log("Editando:", transaction.id),
        },
        {
            children: "Duplicar",
            onClick: () => console.log("Duplicando:", transaction.id),
            className: "text-blue-500",
        },
        {
            children: "Excluir",
            onClick: () => console.log("Excluindo:", transaction.id),
            variant: "destructive",
        }
    ]

    const statusConfig = STATUS_CONFIG[transaction.status]

    const onStatusChange = () => {
        console.log('status mudou')
    }

    return <TransactionCard >
        <TransactionCardInfo transaction={transaction} />
        <TransactionCardFooter>
            <TransactionCardFooterLeft>
                <Checkbox />
                <ShareSwitcher />
            </TransactionCardFooterLeft>
            <TransactionCardFooterRight>
                <StatusBadge statusConfig={statusConfig} current={transaction.status} onClick={onStatusChange} />
                <TransactionMenu actions={actions} />
            </TransactionCardFooterRight>
        </TransactionCardFooter>
    </TransactionCard>
}