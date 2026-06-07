import { findBucketById } from "@/features/buckets/actions"
import { BucketProfileCard } from "@/features/buckets/components/bucket-profile-card"

interface Props {
    params: {
        id: string
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params
    const bucket = await findBucketById(id)

    return <BucketProfileCard balance={0} user={bucket.user} bucket={bucket} />
}