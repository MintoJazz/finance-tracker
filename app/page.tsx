import { Checkbox } from "@/components/ui/checkbox"
import { STATUS_CONFIG } from "@/constants/status"
import TransactionCard, { TransactionCardFooter, TransactionCardFooterLeft, TransactionCardFooterRight, TransactionCardInfo } from "@/features/transaction/list/transaction-card"
import ShareSwitcher from "@/features/transaction/share-switcher"
import StatusBadge from "@/features/transaction/status-badge"
import TransactionMenu from "@/features/transaction/transaction-menu"
import { Transaction } from "@/generated/prisma/client"

export default function Page() {
    const transaction: Transaction = {
        description: 'TesteDescrição',
        status: "PENDING",
        date: new Date(),
        amount: 5000,
        workspaceId: -1,
        id: -1
    }

    const statusConfig = STATUS_CONFIG[transaction.status]

    return <div>
        <TransactionCard >
            <TransactionCardInfo transaction={transaction} />
            <TransactionCardFooter>
                <TransactionCardFooterLeft>
                    <Checkbox />
                    <ShareSwitcher />
                </TransactionCardFooterLeft>
                <TransactionCardFooterRight>
                    <StatusBadge statusConfig={statusConfig} />
                    <TransactionMenu />
                </TransactionCardFooterRight>
            </TransactionCardFooter>
        </TransactionCard>
    </div>
}
