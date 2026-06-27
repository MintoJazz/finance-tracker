"use server"

import { prisma } from "@/lib/prisma"
import { TransactionDetails } from "@/types/database"
import { Action, PendingChange } from "@/types/changes"
import { Movement } from "@/generated/prisma/client"
import { PrismaPromise } from "@/generated/prisma/internal/prismaNamespace"

export type DraftPayload = {
    action: Action
    transaction: TransactionDetails
}

export type PersistResult = {
    succeeded: number[]
    failed: Array<{ id: number; error: string }>
}

const createTransactions = (transactions: TransactionDetails[]) => transactions.map(t => {
    const { description, amount, date, status, type } = t

    const movements = {
        create: t.movements.map(({ amount, role, bucketId }) => ({ amount, role, bucketId }))
    }

    const data = { description, amount, date, status, type, movements }

    return prisma.transaction.create({ data })
})

const deleteMovements = (numbers: number[]) => {
    const validNumbers = numbers.filter(n => n != null)
    const where = { transactionId: { in: validNumbers } }
    return prisma.movement.deleteMany({ where })
}

const updateTransactions = (transactions: TransactionDetails[]) => {
    const validTransactions = transactions.filter(t => t.id != null)
    return [
        deleteMovements(validTransactions.map(t => t.id)),
        ...validTransactions.map(t => {
            const { id, description, amount, date, status, type } = t
            const safeMovements = t.movements || [] 
            const movements = { create: safeMovements.map(({ amount, role, bucketId }) => ({ amount, role, bucketId })) }
            const data = { id, description, amount, date, status, type, movements }
            const where = { id }

            return prisma.transaction.update({ where, data })
        })
    ]
}

const killTransactions = (transactions: TransactionDetails[]) => {
    const where = { id: { in: transactions.map(t => t.id) } }
    return prisma.transaction.deleteMany({ where })
}

const SERIES_ACTIONS: Record<Action, (transaction: TransactionDetails[]) => PrismaPromise<unknown>[] | PrismaPromise<unknown>> = {
    add: createTransactions,
    edit: updateTransactions,
    remove: killTransactions
}

export async function persistDrafts(changes: PendingChange<TransactionDetails>[]): Promise<PersistResult> {
    const succeeded: number[] = []
    const failed: PersistResult["failed"] = []

    const drafts = changes.map(change => ({
        action: change.action,
        transaction: {
            ...change.original,
            ...change.domain
        }
    }) as DraftPayload)

    try {
        await prisma.$transaction([...Object.entries(SERIES_ACTIONS).flatMap(([key, val]) => val(drafts.filter(d => d.action === key).map(d => d.transaction)))])
    } catch (err) {
        console.error("Erro no Prisma:", err)

        let error = "Erro desconhecido ao salvar no banco de dados."
        if (err instanceof Error) error = err.message

        drafts.forEach(d => {
            failed.push({ error, id: d.transaction.id, })
        })
    }


    return { succeeded, failed }
}