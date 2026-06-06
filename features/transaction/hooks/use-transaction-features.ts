import { useManager } from "@/hooks/use-manager"
import { useDraftList } from "@/hooks/use-draft-list"
import { useSelection } from "@/hooks/use-selection"
import { TransactionDetails } from "@/types/database"
import { ActionSet } from "@/types/action-set"
import { TransactionStatus } from "@/generated/prisma/browser"
import { toDomain } from "../mappers/domain-builder"
import { TransactionFormType } from "../form/schema/types"
import { useState } from "react"

export function useTransactionFeatures(initialTransactions: TransactionDetails[]) {
    const [isIncome, setIsIncome] = useState<boolean>(false)

    const { onDelete, onEdit, isCreateOpen, setIsCreateOpen } = useManager<TransactionDetails>()
    const { select, selected } = useSelection()
    const { edit, items, drafts, add } = useDraftList<TransactionDetails>(initialTransactions)

    const isSelected = (id: number) => selected.includes(id)
    const getAction = (id: number) => drafts[id]?.action ?? 'stable'
    const onStatusChange = (id: number, status: TransactionStatus, transaction: TransactionDetails) => edit(id, { status }, transaction)
    const onAddClick = (isIncome: boolean) => {
        setIsIncome(isIncome)
        setIsCreateOpen(true)
    }

    function onSubmitCreate(data: TransactionFormType) {
        const transaction = toDomain(data)
        add(transaction)
        setIsCreateOpen(false)
    }

    const actions: ActionSet<TransactionDetails>[] = [
        {
            children: "Editar",
            onAction: onEdit,
        },
        {
            children: "Excluir",
            onAction: onDelete,
            variant: "destructive",
        },
    ]

    return {
        items,
        drafts,
        isSelected,
        select,
        actions,
        onStatusChange,
        getAction,
        setIsCreateOpen,
        onAddClick,
        createDialogProps: {
            isIncome,
            isOpen: isCreateOpen,
            onClose: setIsCreateOpen,
            onSubmit: onSubmitCreate,
        }
    }
}
