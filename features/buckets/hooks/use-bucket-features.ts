import { useManager } from "@/hooks/use-manager"
import { ActionSet } from "@/types/action-set"
import { BucketList } from "@/types/database"
import { startTransition } from "react"

export interface BucketRow {
    bucket: BucketList
    actions: ActionSet<BucketList>[]
}

export function useBucketFeatures(buckets: BucketList[]) {
    const { target, isDeleteOpen, onCloseDelete, onDelete, onEdit, isCreateOpen, setIsCreateOpen } = useManager<BucketList>()
    const actions: ActionSet<BucketList>[] = [
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

    const handleConfirmDelete = () => {
        if (!target) return
        
        startTransition(async () => {
            await deleteBucketAction(target.id)
            onCloseDelete(false)
        })
    }

    const rows: BucketRow[] = buckets.map(bucket => ({ bucket, actions }))

    return {
        rows,
        setIsCreateOpen,
        deleteBucketProps: {
            open: isDeleteOpen,
            onOpenChange: onCloseDelete
        },
        createDialogProps: {
            isOpen: isCreateOpen,
            onClose: setIsCreateOpen
        }
    }
}