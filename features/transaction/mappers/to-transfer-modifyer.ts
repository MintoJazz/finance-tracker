import { TransactionDetails, TransactionListMovement } from "@/types/database"
import { TransactionFormType } from "../form/schema/types"
import { TransactionType } from "@/generated/prisma/enums"

export function toTransfer(transaction: TransactionDetails, data: TransactionFormType): TransactionDetails {
    const isOrigin = data.type === "INCOME"
    const type: TransactionType = "TRANSFER"
    const movements: TransactionListMovement[] = [...transaction.movements, {
        id: 0,
        transactionId: transaction.id,
        amount: transaction.amount * Math.pow(-1, Number(isOrigin)),
        role: isOrigin ? "TRANSFER_DEBIT" : "TRANSFER_CREDIT",
        bucketId: (data.addOrigin?.bucketId ?? data.addDestination?.bucketId ?? null) as number | null,
        bucket: null,
    }]

    return { ...transaction, movements, type }
}