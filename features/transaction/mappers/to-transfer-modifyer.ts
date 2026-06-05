import { TransactionDetails } from "@/types/database"
import { TransactionFormType } from "../form/schema/types"
import { TransactionType } from "@/generated/prisma/enums"
import { Movement } from "@/generated/prisma/client"

export function toTransfer(transaction: TransactionDetails, data: TransactionFormType) {
    const isOrigin = data.type === "INCOME"
    const type: TransactionType = "TRANSFER"
    const movements: Movement[] = [...transaction.movements, {
        id: 0,
        transactionId: transaction.id,
        amount: transaction.amount * Math.pow(-1, Number(isOrigin)),
        role: isOrigin ? "TRANSFER_DEBIT" : "TRANSFER_CREDIT",
        bucketId: data.addOrigin?.bucketId as number
    }]

    return { ...transaction, movements, type }
}