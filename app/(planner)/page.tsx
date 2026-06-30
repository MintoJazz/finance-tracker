import TransactionViewContainer from "@/app/(planner)/_views/transaction-view-container";
import { findAllBucketOptions } from "@/server/bucket/find-bucket-options";
import { findAllTransactions } from "@/server/transaction/find-all-details";

export default async function Page() {
    const [ transactions, buckets ] = await Promise.all([
        findAllTransactions(),
        findAllBucketOptions(),
    ])
    
    return <div>
        <TransactionViewContainer buckets={buckets} transactions={transactions}/>
    </div>
}