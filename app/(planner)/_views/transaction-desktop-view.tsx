"use client"

import { DataTable } from "@/components/ui/data-table"
import TransactionEmpty from "../../../features/transaction/components/transaction-empty"
import BucketBalanceList from "@/features/buckets/components/bucket-balance-list"
import DateRangeFilter from "@/components/date-range-filter"
import { TransactionActionButtons } from "../../../features/transaction/components/transaction-action-buttons"
import { useTransactionTable } from "@/features/transaction/hooks/use-transaction-table"
import { TransactionViewProps } from "./transaction-view-container"

export default function TransactionDesktopView(props: TransactionViewProps) {
    const { date, setDate, onAddClick, selectAll, onSubmit, balanceListProps, hasDraft, transactions, actions, onStatusChange } = props
    const tableProps = useTransactionTable(transactions, selectAll, onStatusChange, actions)

    return (
        <div className="flex flex-row gap-4 items-stretch max-w-6xl mx-auto p-6 md:py-12">
            {/* Main Content: Tabela */}
            <div className="flex-1 min-w-0">
                {transactions.length === 0 ? <TransactionEmpty /> : <DataTable {...tableProps}/>}
            </div>

            {/* Sidebar Direita */}
            <div className="w-75 shrink-0 flex flex-col gap-2">
                <DateRangeFilter date={date} setDate={setDate} />
                <TransactionActionButtons hasDraft={hasDraft} onSubmit={onSubmit} onAddClick={onAddClick} />
                <BucketBalanceList {...balanceListProps} />
            </div>
        </div>
    )
}