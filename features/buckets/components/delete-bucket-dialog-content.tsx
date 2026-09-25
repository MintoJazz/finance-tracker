"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RouteAlertDialog } from "@/components/route-alert-dialog"
import { killBucketAction } from "../actions"

interface Props {
    bucket: {
        id: number
        name: string
    }
}

export function DeleteBucketDialogContent({ bucket }: Props) {
    const router = useRouter()

    const handleConfirm = async () => {
        try {
            await killBucketAction({ id: bucket.id })
            toast.success(`Bucket "${bucket.name}" excluído com sucesso!`)
            router.back()
        } catch (error) {
            toast.error("Erro ao excluir bucket")
            console.error("[ERRO NA EXCLUSÃO DO BUCKET]", error)
        }
    }

    return (
        <RouteAlertDialog
            title={`Excluir "${bucket.name}"?`}
            description="Essa ação não pode ser desfeita. Todos os lançamentos e saldos vinculados a este bucket serão afetados."
            confirmLabel="Sim, excluir"
            confirmVariant="destructive"
            onConfirm={handleConfirm}
        />
    )
}
