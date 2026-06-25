import { useManager } from "@/hooks/use-manager"
import { useDraftList } from "@/hooks/use-draft-list"
import { useSelection } from "@/hooks/use-selection"
import { BucketOption, TransactionDetails } from "@/types/database"
import { TransactionStatus } from "@/generated/prisma/browser"
import { toDomain } from "../mappers/domain-builder"
import { TransactionFormType } from "../form/schema/types"
import { useState } from "react"
import { ACTION_THEMES, ActionTheme } from "../themes/action-themes"
import { Row } from "@tanstack/react-table"
import { DateRange } from "react-day-picker"
import { RowAction } from "@/components/ui/data-table"

export interface TransactionRow {
    transaction: TransactionDetails
    actionTheme: ActionTheme
    statusBadgeProps: { current: TransactionStatus; onClick: (status: TransactionStatus) => void }
}

export function useTransactionFeatures(initialTransactions: TransactionDetails[], buckets: BucketOption[]) {
    const [isIncome, setIsIncome] = useState<boolean>(false)
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    })

    const { onDelete, onEdit, isCreateOpen, setIsCreateOpen } = useManager<TransactionDetails>()
    const { selectAll } = useSelection()
    const { edit, items, drafts, add } = useDraftList<TransactionDetails>(initialTransactions)

    function onStatusChange(id: number, status: TransactionStatus) {
        const original = initialTransactions.find(t => t.id === id) ?? items.find(t => t.id === id)!
        edit(id, { status }, original)
    }

    function onAddClick(isIncome: boolean) {
        setIsIncome(isIncome)
        setIsCreateOpen(true)
    }

    function onSubmitCreate(data: TransactionFormType) {
        add(toDomain(data, buckets))
        setIsCreateOpen(false)
    }

    const actions: RowAction<TransactionRow>[] = [
        { label: "Editar", onClick: (row) => onEdit(row.original.transaction) },
        { label: "Excluir", onClick: (row) => onDelete(row.original.transaction) },
    ]

    const rows: TransactionRow[] = items.filter(i => {
        const matchesFrom = !date?.from || i.date.getTime() >= date.from.getTime();
        const matchesTo = !date?.to || i.date.getTime() <= date.to.getTime();

        return matchesFrom && matchesTo;
    }).map(transaction => ({
        transaction,
        actionTheme: ACTION_THEMES[drafts[transaction.id]?.action ?? 'stable'],
        statusBadgeProps: {
            current: transaction.status,
            onClick: (status: TransactionStatus) => onStatusChange(transaction.id, status),
        }
    }))

    const onRowSelectionChange = (rowsSelected: Row<TransactionRow>[]) => selectAll(rowsSelected.map(row => row.original.transaction.id))

    return {
        rows,
        actions,
        date,
        setDate,
        onAddClick,
        onRowSelectionChange,
        createDialogProps: {
            buckets,
            isIncome,
            isOpen: isCreateOpen,
            onClose: setIsCreateOpen,
            onSubmit: onSubmitCreate,
        },
    }
}
