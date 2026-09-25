'use client'

import { useRouter } from "next/navigation"
import { RowAction } from "@/components/ui/data-table"
import { BucketList } from "@/types/database"

export function useBucketContainer(buckets: BucketList[]) {
    const router = useRouter()

    const actions: RowAction<BucketList>[] = [
        {
            label: "Editar",
            onClick: (row) => router.push(`/buckets/${row.original.id}/edit`),
        },
        {
            label: "Excluir",
            onClick: (row) => router.push(`/buckets/${row.original.id}/delete`),
        },
    ]

    return { buckets, actions }
}

export type BucketViewProps = ReturnType<typeof useBucketContainer>