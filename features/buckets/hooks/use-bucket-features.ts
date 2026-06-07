import { useManager } from "@/hooks/use-manager"
import { ActionSet } from "@/types/action-set"
import { BucketList } from "@/types/database"
import { startTransition, useState } from "react"
import { deleteBucketById } from "../actions"

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
    const [rows, setRows] = useState<BucketRow[]> (buckets.map(bucket => ({ bucket, actions })))
    
    const handleConfirmDelete = () => {
        if (!target) return

        const prevBucketRows =  rows
        setRows(prev => prev.filter(row => row.bucket.id !== target.id))
        
        startTransition(async () => {
            try {
                await deleteBucketById(target.id)
                onCloseDelete(false)
            } catch (error) {
                setRows(prevBucketRows)
            }
        })
    }


    return {
        rows,
        setIsCreateOpen,
        deleteBucketProps: {
            open: isDeleteOpen,
            onOpenChange: onCloseDelete,
            onSubmit: handleConfirmDelete
        },
        createDialogProps: {
            isOpen: isCreateOpen,
            onClose: setIsCreateOpen
        }
    }
}