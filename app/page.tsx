import { findBucketOptions } from "@/features/buckets/actions";
import { findAllTransactions } from "@/features/transaction/actions";
import TransactionContainer from "@/features/transaction/components/transaction-card-layout";

export default async function Page() {
    const [transactions, buckets] = await Promise.all([
        findAllTransactions(),
        findBucketOptions()
    ])

    return <div>
        <TransactionContainer transactions={transactions} buckets={buckets}/>
    </div>
}