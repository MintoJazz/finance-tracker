"use client"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { BucketOption, TransactionDetails } from "../../../types/database"
import { DataTable } from "@/components/ui/data-table"
import { useTransactionFeatures } from "../hooks/use-transaction-features"
import { desktopColumns } from "./transaction-desktop-columns"
import { mobileColumns } from "./transaction-mobile-columns"
import TransactionEmpty from "./transaction-empty"
import CreateTransaction from "./create-transaction-dialog"
import BucketBalanceList from "@/features/buckets/components/bucket-balance-list"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { cn } from "@/lib/utils"
import DateRangeFilter from "@/components/date-range-filter"

interface Props {
    transactions: TransactionDetails[]
    buckets: BucketOption[]
}

export default function TransactionContainer({ transactions, buckets }: Props) {
    const { hasDraft, rows, date, setDate, onAddClick, onSubmit, createDialogProps, onRowSelectionChange, actions, balanceListProps } = useTransactionFeatures(transactions, buckets)
    const isDesktop = useIsDesktop()

    return (
        <div className="flex flex-col gap-3">

            {/* ── Toolbar + saldos mobile ── */}
            {!isDesktop && (
                <div className="flex flex-col gap-2">
                    <DateRangeFilter date={date} onSelect={setDate} />
                    <ActionButtons hasDraft={hasDraft} onSubmit={onSubmit} onAddClick={onAddClick} />
                    <BucketBalanceList {...balanceListProps} />
                </div>
            )}

            {/* ── Grid principal ── */}
            <div className={cn(isDesktop && "flex gap-4 items-stretch")}>

                {/* Sidebar desktop */}
                <div className={cn(isDesktop ? "order-last w-75 shrink-0 flex flex-col gap-3" : "hidden")}>
                    <DateRangeFilter date={date} onSelect={setDate} />
                    <ActionButtons hasDraft={hasDraft} onSubmit={onSubmit} onAddClick={onAddClick} />
                    <BucketBalanceList {...balanceListProps} />
                </div>

                {/* Tabela */}
                {rows.length === 0 ? (
                    <TransactionEmpty />
                ) : (
                    <DataTable
                        columns={isDesktop ? desktopColumns : mobileColumns}
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

            <CreateTransaction {...createDialogProps} />
        </div>
    )
}

interface ActionButtonsProps {
    hasDraft: boolean
    onSubmit: () => void
    onAddClick: (isIncome: boolean) => void
}

function ActionButtons({ hasDraft, onSubmit, onAddClick }: ActionButtonsProps) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {hasDraft && (
                <Button variant="outline" size="sm" onClick={onSubmit} className="col-span-2">
                    Submit
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onAddClick(false)}>
                <Minus className="h-4 w-4" />Pagar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddClick(true)}>
                <Plus className="h-4 w-4" />Receber
            </Button>
        </div>
    )
}