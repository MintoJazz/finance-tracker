'use server'

import { findAllBuckets } from "@/features/buckets/actions"
import CreateTransaction from "@/features/transaction/transaction-form/create-form"



export default async function TransactionTestPage() {
    const [buckets] = await Promise.all([
        findAllBuckets()
    ])

    return <div className="mb-6 space-y-1">
        <CreateTransaction buckets={buckets} isOpen />
    </div>
}