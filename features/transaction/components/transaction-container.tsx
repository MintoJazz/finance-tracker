"use client"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Minus, Plus } from "lucide-react"
import { BucketOption, TransactionDetails } from "../../../types/database"
import { DataTable } from "@/components/ui/data-table"
import { useTransactionFeatures } from "../hooks/use-transaction-features"
import { desktopColumns } from "./transaction-desktop-columns"
import { mobileColumns } from "./transaction-mobile-columns"
import TransactionEmpty from "./transaction-empty"
import CreateTransaction from "./create-transaction-dialog"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { formatarData } from "@/lib/formatters"

interface Props {
    transactions: TransactionDetails[]
    buckets: BucketOption[]
}

export default function TransactionContainer({ transactions, buckets }: Props) {
    const { rows, date, setDate, onAddClick, createDialogProps, onRowSelectionChange, actions } = useTransactionFeatures(transactions, buckets)
    const isDesktop = useIsDesktop()

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker-range"
                            className="justify-start px-2.5 font-normal"
                        >
                            <CalendarIcon />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {formatarData(date.from)} -{" "}
                                        {formatarData(date.to)}
                                    </>
                                ) : (
                                    formatarData(date.from)
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            required={false}
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            captionLayout="dropdown"
                        />
                    </PopoverContent>
                </Popover>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
                    <Button variant="outline" size="sm" onClick={() => onAddClick(false)}><Minus className="h-4 w-4" />Pagar</Button>
                    <Button variant="outline" size="sm" onClick={() => onAddClick(true)}><Plus className="h-4 w-4" />Receber</Button>
                </div>
            </div>

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

            <CreateTransaction {...createDialogProps} />
        </div>
    )
}
