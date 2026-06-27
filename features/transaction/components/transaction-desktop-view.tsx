"use client"
import { DataTable } from "@/components/ui/data-table"
import { desktopColumns } from "./transaction-desktop-columns"
import TransactionEmpty from "./transaction-empty"
import BucketBalanceList from "@/features/buckets/components/bucket-balance-list"
import DateRangeFilter from "@/components/date-range-filter"
import { TransactionActionButtons } from "./transaction-action-buttons"
import { TransactionViewProps } from "./transaction-container"

export default function TransactionDesktopView(props: TransactionViewProps) {
    const { rows, date, setDate, onAddClick, onSubmit, onRowSelectionChange, actions, balanceListProps, hasDraft } = props

    return (
        <div className="flex flex-row gap-4 items-stretch max-w-6xl mx-auto p-6 md:py-12">
            {/* Main Content: Tabela */}
            <div className="flex-1 min-w-0">
                {rows.length === 0 ? (
                    <TransactionEmpty />
                ) : (
                    <DataTable
                        columns={desktopColumns}
                        data={rows}
                        rowActions={actions}
                        filterColumn="description"
                        filterPlaceholder="Filtrar descrição..."
                        pageSize={10}
                        enableRowSelection
                        onRowSelectionChange={onRowSelectionChange}
                    />
                )}
            </div>
            
            {/* Sidebar Direita */}
            <div className="w-75 shrink-0 flex flex-col gap-2">
                <DateRangeFilter date={date} onSelect={setDate} />
                <TransactionActionButtons hasDraft={hasDraft} onSubmit={onSubmit} onAddClick={onAddClick} />
                <BucketBalanceList {...balanceListProps} />
            </div>
        </div>
    )
}