import { findAllBuckets } from "@/features/buckets/actions";
import { findAllTransactions } from "@/features/transaction/actions";
import TransactionContainer from "@/features/transaction/transaction-container/layout";

export default async function Page() {
    const [transactions, buckets] = await Promise.all([
        findAllTransactions(),
        findAllBuckets()
    ])

    return <div>
        <TransactionContainer transactions={transactions} buckets={buckets}/>
    </div>
}