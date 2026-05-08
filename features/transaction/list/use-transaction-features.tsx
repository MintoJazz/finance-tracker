import { useManager } from "@/hooks/use-manager"
import { useDraftList } from "@/hooks/use-draft-list"
import { useSelection } from "@/hooks/use-selection"
import { TransactionDetails } from "@/types/database"
import { ActionSet } from "@/types/action-set"
import { TransactionStatus } from "@/generated/prisma/browser"

export function useTransactionFeatures(initialTransactions: TransactionDetails[]) {
    const { onDelete, onEdit } = useManager<TransactionDetails>()
    const { select, selected } = useSelection()
    const { edit, items, drafts } = useDraftList<TransactionDetails>(initialTransactions)

    const onStatusChange = (id: number, status: TransactionStatus, transaction: TransactionDetails) => {
        edit(id, { status }, transaction)
    }

    const isSelected = (id: number) => selected.includes(id)
    const getAction = (id: number) => drafts[id]?.action

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
        getAction
    }
}