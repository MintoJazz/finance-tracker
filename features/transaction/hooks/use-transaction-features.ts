import { useManager } from "@/hooks/use-manager"
import { useDraftList } from "@/hooks/use-draft-list"
import { useSelection } from "@/hooks/use-selection"
import { TransactionDetails } from "@/types/database"
import { ActionSet } from "@/types/action-set"
import { TransactionStatus } from "@/generated/prisma/browser"
import { toDomain } from "../mappers/domain-builder"
import { TransactionFormType } from "../form/schema/types"
import { useState } from "react"
import { ACTION_THEMES, ActionTheme } from "../themes/action-styles"

export interface TransactionRow {
    transaction: TransactionDetails
    actionTheme: ActionTheme
    statusBadgeProps: { current: TransactionStatus; onClick: (status: TransactionStatus) => void }
    checkboxProps: { checked: boolean; onCheckedChange: () => void }
    actions: ActionSet<TransactionDetails>[]
}

export function useTransactionFeatures(initialTransactions: TransactionDetails[]) {
    const [isIncome, setIsIncome] = useState<boolean>(false)
    const { onDelete, onEdit, isCreateOpen, setIsCreateOpen } = useManager<TransactionDetails>()
    const { select, selected } = useSelection()
    const { edit, items, drafts, add } = useDraftList<TransactionDetails>(initialTransactions)

    const isSelected = (id: number) => selected.includes(id)

    function onStatusChange(id: number, status: TransactionStatus) {
        const original = initialTransactions.find(t => t.id === id) ?? items.find(t => t.id === id)!
        edit(id, { status }, original)
    }

    function onAddClick(isIncome: boolean) {
        setIsIncome(isIncome)
        setIsCreateOpen(true)
    }

    function onSubmitCreate(data: TransactionFormType) {
        add(toDomain(data))
        setIsCreateOpen(false)
    }

    const actions: ActionSet<TransactionDetails>[] = [
        { children: "Editar",  onAction: onEdit },
        { children: "Excluir", onAction: onDelete, variant: "destructive" },
    ]

    const rows: TransactionRow[] = items.map(transaction => ({
        transaction,
        actionTheme: ACTION_THEMES[drafts[transaction.id]?.action ?? 'stable'],
        statusBadgeProps: {
            current: transaction.status,
            onClick: (status: TransactionStatus) => onStatusChange(transaction.id, status),
        },
        checkboxProps: {
            checked: isSelected(transaction.id),
            onCheckedChange: () => select(transaction.id),
        },
        actions,
    }))

    return {
        rows,
        onAddClick,
        createDialogProps: {
            isIncome,
            isOpen: isCreateOpen,
            onClose: setIsCreateOpen,
            onSubmit: onSubmitCreate,
        },
    }
}
