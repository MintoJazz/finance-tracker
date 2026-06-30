"use server"

import { revalidatePath } from "next/cache"
import { persistDrafts } from "@/server/transaction/persist-drafts"
import { PendingChange } from "@/types/changes"
import { TransactionDetails } from "@/types/database"

export async function persistDraftsAction(
    changes: PendingChange<TransactionDetails>[]
) {
    try {
        const result = await persistDrafts(changes)

        revalidatePath("/planner")

        return result
    } catch (error) {
        console.error("Erro ao persistir drafts:", error)

        return {
            succeeded: [],
            failed: changes.map(change => ({
                id: change.original?.id,
                error: "Erro interno ao salvar as alterações."
            }))
        }
    }
}