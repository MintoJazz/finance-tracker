import { useManager } from "@/hooks/use-manager"
import { ActionSet } from "@/types/action-set"
import { BucketList } from "@/types/database"

export function useBucketFeatures() {
    const { onDelete, onEdit, isCreateOpen, setIsCreateOpen } = useManager<BucketList>()
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

    return {
        actions,
        setIsCreateOpen,
        createDialogProps: {
            isOpen: isCreateOpen,
            onClose: setIsCreateOpen
        }
    }
}