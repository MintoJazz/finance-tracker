import { findAllTransactions } from "@/features/transaction/actions";
import TransactionContainer from "@/features/transaction/components/transaction-container";

export default async function Page() {
    const transactions = await findAllTransactions()

    return <div>
        <TransactionContainer transactions={transactions}/>
    </div>
}