"use client"

import { BucketList } from "@/types/database"
import { RowAction } from "@/components/ui/data-table"
import BucketListItem from "./bucket-list-item"

interface Props {
    buckets: BucketList[]
    actions: RowAction<BucketList>[]
}

export function BucketsList({ buckets, actions }: Props) {
    return <ul className="divide-y rounded-lg border">
        {buckets.map((bucket) => {
            const props = {
                actions: actions,
                bucket: bucket
            }

            return <BucketListItem key={bucket.id} {...props} />
        })}
    </ul>
}