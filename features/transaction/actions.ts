"use server"

import { prisma } from "@/lib/prisma"
import { TransactionDetails } from "./types/database"

export const findAllTransactions = async () => prisma.transaction.findMany({ include: {
    movements: true
} }) as Promise<TransactionDetails[]>