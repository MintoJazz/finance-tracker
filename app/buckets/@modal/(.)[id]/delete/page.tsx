import { notFound } from "next/navigation"
import { findBucketById } from "@/server/bucket/find-bucket-by-id"
import { DeleteBucketDialogContent } from "@/features/buckets/components/delete-bucket-dialog-content"

interface Props {
    params: Promise<{ id: string }>
}

export default async function InterceptedDeleteBucketModal({ params }: Props) {
    const { id } = await params
    const bucket = await findBucketById(id).catch(() => null)

    if (!bucket) {
        notFound()
    }

    return (
        <DeleteBucketDialogContent
            bucket={{
                id: bucket.id,
                name: bucket.name,
            }}
        />
    )
}
