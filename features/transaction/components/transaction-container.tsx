"use client"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { Bucket } from "@/generated/prisma/client"
import { TransactionDetails } from "../../../types/database"
import { DataTable } from "@/components/ui/data-table"
import { useTransactionFeatures } from "../hooks/use-transaction-features"
import { desktopColumns } from "./transaction-desktop-columns"
import { mobileColumns } from "./transaction-mobile-columns"
import TransactionEmpty from "./transaction-empty"
import CreateTransaction from "./create-transaction-dialog"
import { useIsDesktop } from "@/hooks/use-breakpoint"

interface Props {
    transactions: TransactionDetails[]
    buckets: Bucket[]
}

export default function TransactionContainer({ transactions, buckets }: Props) {
    const { rows, onAddClick, createDialogProps, onRowSelectionChange } = useTransactionFeatures(transactions)
    const isDesktop = useIsDesktop()

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-2">
                <Button className="flex-1" onClick={() => onAddClick(false)}><Minus /> Pagar</Button>
                <Button className="flex-1" onClick={() => onAddClick(true)}><Plus /> Receber</Button>
            </div>

            {rows.length === 0 ? (
                <TransactionEmpty />
            ) : (
                <DataTable
                    columns={isDesktop ? desktopColumns : mobileColumns}
                    data={rows}
                    showHeader={isDesktop}
                    filterColumn="description"
                    filterPlaceholder="Filtrar descrição..."
                    pageSize={10}
                    enableRowSelection
                    onRowSelectionChange={onRowSelectionChange}
                />
            )}

            <CreateTransaction buckets={buckets} {...createDialogProps} />
        </div>
    )
}
