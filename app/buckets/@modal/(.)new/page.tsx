import { RouteModal } from "@/components/route-modal"
import { findAllUserOptions } from "@/server/user/find-all-user-options"
import { CreateBucketFormContent } from "@/features/buckets/components/create-bucket-form-content"

export default async function InterceptedNewBucketModal() {
    const users = await findAllUserOptions()

    return (
        <RouteModal title="Novo Bucket" description="Insira aqui os dados para criar um novo Bucket">
            <CreateBucketFormContent users={users} />
        </RouteModal>
    )
}
