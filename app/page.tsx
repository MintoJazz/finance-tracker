import { findAllTransactions } from "@/features/transaction/server/queries";
import TransactionContainer from "@/features/transaction/components/transaction-container";
import { findAllBucketOptions } from "@/features/buckets/server/queries";

export default async function Page() {
    const [ transactions, buckets ] = await Promise.all([
        findAllTransactions(),
        findAllBucketOptions(),
    ])
    
    return <div>
        <TransactionContainer buckets={buckets} transactions={transactions}/>
    </div>
}