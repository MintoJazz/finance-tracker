"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { killBucketAction } from "../actions"

interface Props {
    bucket: {
        id: number
        name: string
    }
}

export function DeleteBucketCard({ bucket }: Props) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    const handleDelete = async () => {
        try {
            setIsPending(true)
            await killBucketAction({ id: bucket.id })
            toast.success(`Bucket "${bucket.name}" excluído com sucesso!`)
            router.push("/buckets")
        } catch (error) {
            toast.error("Erro ao excluir bucket")
            console.error("[ERRO NA EXCLUSÃO DO BUCKET]", error)
            setIsPending(false)
        }
    }

    return (
        <Card className="border-destructive/30">
            <CardHeader>
                <CardTitle className="text-destructive">Excluir Bucket &quot;{bucket.name}&quot;?</CardTitle>
                <CardDescription>
                    Esta ação é permanente e irreversível. Todos os lançamentos vinculados a este bucket serão afetados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Tem certeza de que deseja prosseguir com a remoção deste bucket do seu sistema?
                </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t p-4">
                <Button variant="outline" asChild disabled={isPending}>
                    <Link href="/buckets">Cancelar</Link>
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                    {isPending ? "Excluindo..." : "Confirmar Exclusão"}
                </Button>
            </CardFooter>
        </Card>
    )
}
