"use client"

import { BucketList } from "@/types/database"
import { bucketColumns } from "./bucket-columns"
import { DataTable, RowAction } from "@/components/ui/data-table"

interface Props {
    buckets: BucketList[]
    actions: RowAction<BucketList>[]
}

export function BucketsTable({ buckets, actions }: Props) {
    return <DataTable
        columns={bucketColumns}
        data={buckets}
        rowActions={actions}
        // onRowClick={(row) => actions.view(row.original)}
        pageSize={10}
    />
}
