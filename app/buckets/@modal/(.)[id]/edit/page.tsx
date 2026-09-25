import { notFound } from "next/navigation"
import { RouteModal } from "@/components/route-modal"
import { findBucketById } from "@/server/bucket/find-bucket-by-id"
import { findAllUserOptions } from "@/server/user/find-all-user-options"
import { UpdateBucketFormContent } from "@/features/buckets/components/update-bucket-form-content"

interface Props {
    params: Promise<{ id: string }>
}

export default async function InterceptedEditBucketModal({ params }: Props) {
    const { id } = await params
    const [bucket, users] = await Promise.all([
        findBucketById(id).catch(() => null),
        findAllUserOptions(),
    ])

    if (!bucket) {
        notFound()
    }

    return (
        <RouteModal
            title="Editar Bucket"
            description="Insira aqui os dados para atualizar o Bucket"
        >
            <UpdateBucketFormContent bucket={bucket} users={users} />
        </RouteModal>
    )
}
