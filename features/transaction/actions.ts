"use server"

import { revalidatePath } from "next/cache"
import { persistDrafts } from "@/server/transaction/persist-drafts"
import { PendingChange } from "@/types/changes"
import { TransactionDetails } from "@/types/database"

import { findAllBucketOptions } from "@/server/bucket/find-bucket-options"
import { toDomain } from "./mappers/domain-builder"
import { TransactionFormType } from "./form/schema/types"

export async function persistDraftsAction(
    changes: PendingChange<TransactionDetails>[]
) {
    try {
        const result = await persistDrafts(changes)

        revalidatePath("/")
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

export async function createTransactionAction(data: TransactionFormType) {
    try {
        const buckets = await findAllBucketOptions()
        const domain = toDomain(data, buckets)
        const result = await persistDrafts([{ action: "add", original: domain, domain }])

        revalidatePath("/")
        revalidatePath("/planner")

        if (result.failed.length > 0) {
            return { success: false, error: result.failed[0].error }
        }

        return { success: true, result }
    } catch (error) {
        console.error("Erro ao criar transação:", error)
        return { success: false, error: "Ocorreu um erro interno ao tentar criar a transação." }
    }
}