import { TransactionDetails } from "@/types/database"
import TransactionEmpty from "../transaction-empty"
import { RowAction } from "@/components/ui/data-table"
import { TransactionMobileItem } from "../transaction-mobile-item"
import { TransactionStatus } from "@/generated/prisma/enums"

interface Props {
    transactions: TransactionDetails[]
    actions: RowAction<TransactionDetails>[]
    selected: number[]
    onSelect: (id: number) => void
    onStatusChange: (id: number, status: TransactionStatus) => void;
}

export default function TransactionList({ transactions, actions, selected, onSelect, onStatusChange }: Props) {
    return <div className="flex-1 divide-y divide-border">
        {transactions.length === 0 ? (
            <div className="py-16">
                <TransactionEmpty />
            </div>
        ) : (
            transactions.map(transaction => {
                const itemProps = {
                    transaction, actions, onSelect, onStatusChange,
                    isSelected: selected.includes(transaction.id),
                }

                return <TransactionMobileItem key={transaction.id} {...itemProps} />
            })
        )}
    </div>
}