import { findAllTransactions } from "@/features/transaction/server/queries";
import TransactionViewContainer from "@/app/(planner)/_views/transaction-view-container";
import { findAllBucketOptions } from "@/features/buckets/server/queries";

export default async function Page() {
    const [ transactions, buckets ] = await Promise.all([
        findAllTransactions(),
        findAllBucketOptions(),
    ])
    
    return <div>
        <TransactionViewContainer buckets={buckets} transactions={transactions}/>
    </div>
}