'use client'

import { RowAction } from "@/components/ui/data-table";
import { BucketFormType } from "@/features/buckets/form/schema/bucket-schema";
import { createBucket, killBucketsByKey, updateBucketsByKey } from "@/features/buckets/server/actions";
import { Bucket } from "@/generated/prisma/browser";
import { useManager } from "@/hooks/use-manager";
import { BucketList } from "@/types/database";
import { toast } from "sonner";

export function useBucketContainer() {
    const {
        isCreateOpen, isUpdateOpen, isDeleteOpen,
        setIsCreateOpen, onCloseDelete, onCloseUpdate,
        onDelete, onEdit, target
    } = useManager<Bucket>()

    const actions: RowAction<BucketList>[] = [
        {
            label: "Editar",
            onClick: (row) => onEdit(row.original),
        },
        {
            label: "Excluir",
            onClick: (row) => onDelete(row.original),
        }
    ]

    const createProps = {
        open: isCreateOpen,
        onOpenChange: setIsCreateOpen,
        onSubmit: async (data: BucketFormType) => {
            try {
                await createBucket(data)
                setIsCreateOpen(false)
            } catch (error) {
                toast.error("Não foi possivel adicionar o novo bucket")
                console.log("[ERRO NA INSERÇÃO DO BUCKET]", error);
            }
        }
    }

    const updateProps = {
        target,
        open: isUpdateOpen,
        onOpenChange: onCloseUpdate,
        onSubmit: async (data: BucketFormType) => {
            if (!target) return
            const { id } = target

            try {
                await updateBucketsByKey(data, { id })
                onCloseUpdate(false)
            } catch (error) {
                toast.error("Não foi possivel editar o bucket")
                console.log("[ERRO NA INSERÇÃO DO BUCKET]", error);
            }
        }
    }

    const deleteProps = {
        open: isDeleteOpen,
        onOpenChange: onCloseDelete,
        onSubmit: async () => {
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

    }

    return { setIsCreateOpen, actions, createProps, updateProps, deleteProps }
}