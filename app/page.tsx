import { findAllTransactions } from "@/features/transaction/actions";
import TransactionContainer from "@/features/transaction/transaction-container";

export default async function Page() {
    const [transactions] = await Promise.all([
        findAllTransactions()
    ])

    return <div>
        <TransactionContainer transactions={transactions}/>
    </div>
}