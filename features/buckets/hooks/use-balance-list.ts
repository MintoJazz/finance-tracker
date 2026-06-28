import { useMemo } from "react"
import { BucketBalance, TransactionDetails } from "@/types/database"

export function useBalanceList(transactions: TransactionDetails[]) {
    const buckets = useMemo(() => {
        const map = new Map<number, BucketBalance>()

        for (const transaction of transactions) {
            for (const m of transaction.movements) {
                const movement = {
                    ...m, description: transaction.description
                }

                if (!movement.bucketId || !movement.bucket) continue

                const existing = map.get(movement.bucketId)

                if (existing) {
                    existing.balance += movement.amount
                    existing.movements.push(movement)
                } else {
                    map.set(movement.bucketId, {
                        id: movement.bucket.id,
                        name: movement.bucket.name,
                        userId: 0,
                        type: "CHECKING", // placeholder — não usado nesse contexto
                        balance: movement.amount,
                        movements: [movement],
                    } as BucketBalance)
                }
            }
        }

        return Array.from(map.values())
    }, [transactions])

    return { buckets }
}