import { useManager } from "@/hooks/use-manager"
import { ActionSet } from "@/types/action-set"
import { BucketList } from "@/types/database"
import { toast } from "sonner"
import { BucketFormType } from "../form/schema/bucket-schema"
import { createBucket, killBucketsByKey, updateBucketsByKey } from "../server/actions"

export interface BucketRow {
    bucket: BucketList
    actions: ActionSet<BucketList>[]
}

export function useBucketFeatures(buckets: BucketList[]) {
    const { 
        target, isCreateOpen, setIsCreateOpen,
        isDeleteOpen, onCloseDelete, onDelete, 
        onEdit, isUpdateOpen, onCloseUpdate
    } = useManager<BucketList>()

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

    const rows = buckets.map(bucket => ({ bucket, actions }))

    const handleConfirmDelete = async () => {
        if (!target) return
        const { id } = target

        try {
            await killBucketsByKey({ id })
            onCloseDelete(false)
        } catch (error) {
            toast.error("Erro ao excluir Bucket")
            console.log("[ERRO NA EXCLUSÃO DO BUCKET]", error)
        }
    }

    const onSubmitCreate = async (data: BucketFormType) => {
        try {
            await createBucket(data)
            setIsCreateOpen(false)
        } catch (error) {
            toast.error("Não foi possivel adicionar o novo bucket")
            console.log("[ERRO NA INSERÇÃO DO BUCKET]", error);
        }
    }

    const onSubmitUpdate = async(data: BucketFormType) => {
        if (!target) return
        const { id } = target

        try {
            await updateBucketsByKey(data ,{ id })
            onCloseUpdate(false)
        } catch (error) {
            toast.error("Não foi possivel editar o bucket")
            console.log("[ERRO NA INSERÇÃO DO BUCKET]", error);
        }
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
            open: isCreateOpen,
            onOpenChange: setIsCreateOpen,
            onSubmit: onSubmitCreate
        }, 
        updateDialogProps: {
            target,
            open: isUpdateOpen,
            onOpenChange: onCloseUpdate,
            onSubmit: onSubmitUpdate
        }
    }
}