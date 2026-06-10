'use server'

import { findAllBuckets } from "@/features/buckets/server/queries"
import BucketContainer from "@/features/buckets/components/bucket-container"

export default async function Page() {
    const buckets = await findAllBuckets()

    return <div className="flex flex-col gap-2">
        <BucketContainer buckets={buckets} />
    </div>
}