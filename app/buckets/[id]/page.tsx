import { findBucketById } from "@/features/buckets/actions"
import { BucketProfileCard } from "@/features/buckets/components/bucket-profile-card"
import { formatarDinheiro } from "@/lib/formatters"

interface Props {
    params: {
        id: string
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params
    const bucket = await findBucketById(id)

    return <div className="flex flex-col gap-4">
        <BucketProfileCard balance={0} user={bucket.user} bucket={bucket} />
        {bucket.movements.map(m => <div key={m.id}>{m.transaction.description} - {formatarDinheiro(m.amount)}</div>)}
    </div>
}