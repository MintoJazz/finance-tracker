import { findBucketById } from "@/features/buckets/server/queries"
import { BucketProfileCard } from "@/features/buckets/components/bucket-profile-card"
import { formatMoney } from "@/lib/formatters"

interface Props {
    params: Promise<{
        id: string
    }>
}

export default async function Page({ params }: Props) {
    const { id } = await params
    const bucket = await findBucketById(id)

    return <div className="flex flex-col gap-4">
        <BucketProfileCard balance={0} user={bucket.user} bucket={bucket} />
        {bucket.movements.map(m => <div key={m.id}>{m.transaction.description} - {formatMoney(m.amount)}</div>)}
    </div>
}