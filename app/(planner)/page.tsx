"use server"

import { ViewContainer } from "@/components/adaptive";
import { findAllTransactions } from "@/server/transaction/find-all-details";
import { views } from "./config";

export default async function Page() {
    const transactions = await findAllTransactions()
    
    return <ViewContainer data={transactions} views={views} />
}